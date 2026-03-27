<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Slideshow module upgrade.
 *
 * @package    mod_slideshow
 * @copyright  2026
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Execute slideshow upgrade from the given old version.
 *
 * @param int $oldversion
 * @return bool
 */
function xmldb_slideshow_upgrade($oldversion) {

    if ($oldversion < 2023100906) {
        require_once(__DIR__ . '/../lib.php');
        slideshow_upgrade_migrate_slide_content_files();
        upgrade_mod_savepoint(true, 2023100906, 'slideshow');
    }

    return true;
}
