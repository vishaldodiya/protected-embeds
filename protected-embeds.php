<?php
/**
 * Plugin Name: Protected Embeds
 * Description: WordPress VIP like protected embed adding interface.
 * Version: 1.0.0
 * Text Domain: protected-embeds
 * Author: Vishal Dodiya
 */

use Protected_Embeds\Shortcode;

define( 'PROTECTED_EMBEDS_ROOT', __DIR__ );
define( 'PROTECTED_EMBEDS_URL', trailingslashit( plugins_url( '', __FILE__ ) ) );
define( 'PROTECTED_EMBEDS_VERSION', '1.0.0' );

function protected_embeds_loader() {
	require PROTECTED_EMBEDS_ROOT . '/classes/class-shortcode.php';
	new Shortcode();
}

protected_embeds_loader();
