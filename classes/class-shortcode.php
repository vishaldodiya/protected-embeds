<?php

namespace Protected_Embeds;

class Shortcode {

	function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'action_admin_enqueue_scripts' ] );
		add_action( 'wp_ajax_create_protected_embed', [ $this, 'create_protected_embed' ] );
		add_shortcode( 'protected-embed', [ $this, 'shortcode_protected_embed' ] );
	}

	public function action_admin_enqueue_scripts() {
		wp_enqueue_script(
			'embeds-menu-js',
			PROTECTED_EMBEDS_URL . '/js/custom-media-menu.js',
			[ 'media-views' ],
			PROTECTED_EMBEDS_VERSION,
			true
		);

		wp_enqueue_style(
			'embed-menu-css',
			PROTECTED_EMBEDS_URL . '/css/admin.css',
			[ 'media-views' ],
			PROTECTED_EMBEDS_VERSION
		);
	}

	public function create_protected_embed() {
		$embed_code = filter_input( INPUT_POST, 'embedCode' );

		if ( empty( $embed_code )  ) {
			wp_send_json_error();
		}

		$embed_key = hash( 'md5', $embed_code );
		if ( empty( $embed_key ) ) {
			wp_send_json_error();
		}
		update_option( $embed_key, $embed_code );
		wp_send_json_success( [ 'embedKey' => $embed_key ] );
	}

	public function shortcode_protected_embed( $atts = [], $content = '' ) {
		static $instance = 0;

		$default_atts = [
			'id' => '',
		];

		$atts     = shortcode_atts( $default_atts, $atts );
		$embed_id = $atts['id'];

		if ( ! empty( $content ) ) {
			$content = wp_kses_post( $content );
		}
		$embed_code = get_option( $embed_id );
		$instance++;
		return ( false !== $embed_code ) ? $embed_code . $content : $content;

	}
}
