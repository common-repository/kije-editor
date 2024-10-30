<?php
/*
Plugin Name: Kije Editor
Description: Kije Editor is best way to apply theme to your post
Author: Kijekoon
Version: 1.5
Author URI: https://twitter.com/1kije
*/

add_action('admin_init', 'kije_init');

add_action('admin_head', 'kije_add_my_tc_button');

add_filter('mce_buttons', 'kije_remove_tiny_mce_buttons');

add_filter('mce_buttons_2', 'kije_remove_tiny_mce_buttons_2');

function setGoogleFonts() {
    echo '<link href="https://fonts.googleapis.com/css?family=ABeeZee|Libre+Franklin|Lora:400,400i|Montserrat:400,700|Muli|Open+Sans|PT+Serif" rel="stylesheet">';
    echo '<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">';
}
add_action('wp_head', 'setGoogleFonts');
wp_register_style('kije-main-style', plugins_url('/kije-editor-style.css', __FILE__));
wp_enqueue_style('kije-main-style');

function kije_init() {
	wp_register_style('kije-main-style', plugins_url('/kije-editor-style.css', __FILE__));
	wp_enqueue_style('kije-main-style');
    wp_register_script('kije-master-js', plugins_url('/kije-editor.js', __FILE__));
}

function kije_remove_tiny_mce_buttons($buttons) {
    $remove_buttons = array('bold','formatselect', 'italic', 'strikethrough', 'bullist', 'numlist', 'blockquote', 'hr', 'alignleft', 'aligncenter', 'alignright', 'link', 'unlink', 'wp_more', 'spellchecker', 'dfw', 'wp_adv');
    foreach ( $buttons as $button_key => $button_value ) {
        if ( in_array( $button_value, $remove_buttons ) ) {
            unset( $buttons[ $button_key ] );
        }
    }
    return $buttons;
}

function kije_remove_tiny_mce_buttons_2( $buttons ) {
    $remove_buttons = array('formatselect', 'underline', 'alignjustify', 'forecolor', 'pastetext', 'removeformat', 'charmap', 'outdent', 'indent', 'undo', 'redo', 'wp_help');
    foreach ( $buttons as $button_key => $button_value ) {
        if ( in_array( $button_value, $remove_buttons ) ) {
            unset( $buttons[ $button_key ] );
        }
    }
    return $buttons;
}

function kije_add_my_tc_button() {
    global $typenow;

    if ( !current_user_can('edit_posts') && !current_user_can('edit_pages') ) {
   	return;
    }

    if( ! in_array( $typenow, array( 'post', 'page' ) ) )
        return;

	if ( get_user_option('rich_editing') == 'true') {

        add_filter("mce_external_plugins", "kije_add_custom_button"); // ?

		add_filter("mce_external_plugins", "kije_add_tinymce_plugin");
		add_filter('mce_buttons', 'kije_register_my_tc_button');
	}
}

function kije_add_custom_button($plugin_array) {
    $plugin_array['kije_add_button'] = plugins_url('/kije-add-button.js', __FILE__);
    return $plugin_array;
}


function kije_add_tinymce_plugin($plugin_array) {
	$plugin_array['kije_tc_button'] = plugins_url('/kije-editor.js', __FILE__);
	return $plugin_array;
}

function kije_register_my_tc_button($buttons) {
    array_push($buttons, 'kije_add_button');
	array_push($buttons, 'kije_tc_button');
	return $buttons;
}


