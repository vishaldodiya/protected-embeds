var ProtectedEmbed = {
	peController: {},
	peToolbar: {},
	peView: {},
	init: function() {
		var media = wp.media,
			postFrame = media.view.MediaFrame.Post;

		this.peController = media.controller.State.extend({

			initialize: function(){
				this.props = new Backbone.Model({ // Create model props.
					embed_code: ''
				});
				this.props.on( 'change:embed_code', this.refresh, this ); // Bind event on modal element value change.
			},

			refresh: function() {
				this.frame.toolbar.get().refresh(); // update the toolbar
			},

			// called when the toolbar button is clicked
			customAction: function(){
				var _self = this,
					request = wp.ajax.post( 'create_protected_embed', {
						embedCode: this.props.get('embed_code')
					});

				request.done( function( data ) {
					if ( 'undefined' !== typeof data && 'string' === typeof data.embedKey ) {
						media.editor.insert( '[protected-embed id="' + data.embedKey + '"]' );
						_self.frame.close();
					}
				});
			}
		});
		this.peToolbar = media.view.Toolbar.extend({
			initialize: function() {
				_.defaults( this.options, {
					event: 'add_to_post',
					close: false,
					items: {
						add_to_post: {
							id: 'pe_button',
							text: 'Add to Post',
							style: 'primary',
							priority: 80,
							requires: false,
							click: this.customAction
						}
					}
				});

				media.view.Toolbar.prototype.initialize.apply( this, arguments );
			},

			// called each time the model changes
			refresh: function() {
				var custom_data = this.controller.state().props.get( 'embed_code' );
				this.get( 'add_to_post' ).model.set( 'disabled', ! custom_data );
				wp.media.view.Toolbar.prototype.refresh.apply( this, arguments );
			},

			// triggered when the button is clicked
			customAction: function(){
				this.controller.state().customAction();
			}
		});
		this.peView = media.View.extend({
			className: 'pe-view',

			// bind view events
			events: {
				'change': 'pe_update'
			},

			initialize: function() {

				this.label = jQuery( '<label/>', {
					id: 'pe_label',
					text: 'Enter embed code'
				} );

				// create an input
				this.textarea = jQuery( '<textarea/>', {
					id: 'pe_textarea',
					value: this.model.get('embed_code')
				});

				// insert it in the view
				this.$el.append( this.label, this.textarea );

				// re-render the view when the model changes
				this.model.on( 'change:embed_code', this.render, this );
			},

			render: function(){
				this.textarea.value = this.model.get('embed_code');
				return this;
			},

			pe_update: function( event ) {
				this.model.set( 'embed_code', event.target.value );
			}
		});
		media.view.MediaFrame.Post = postFrame.extend({

			initialize: function() {
				postFrame.prototype.initialize.apply( this, arguments );

				this.states.add([
					new ProtectedEmbed.peController({
						id: 'protected-embeds',
						menu: 'default',
						content: 'protected-embeds',
						title: 'Protected Embeds',
						priority: 200,
						toolbar: 'protected-embeds-toolbar'
					})
				]);

				this.on( 'content:render:protected-embeds', this.peContent, this );
				this.on( 'toolbar:create:protected-embeds-toolbar', this.createPEToolbar, this );
			},

			createPEToolbar: function(toolbar){
				toolbar.view = new ProtectedEmbed.peToolbar({
					controller: this
				});
			},

			peContent: function(){
				var view;
				// this view has no router
				this.$el.addClass('hide-router');

				// custom content view
				view = new ProtectedEmbed.peView({
					controller: this,
					model: this.state().props
				});

				this.content.set( view );
			}

		});
	}
};

ProtectedEmbed.init();
