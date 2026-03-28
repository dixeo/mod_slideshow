<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Slideshow module upgrade.
 *
 * @package    mod_slideshow
 * @copyright  2024 Josemaria Bolanos <admin@mako.digital>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

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

    if ($oldversion < 2026032811) {
        // Moodle 2 backup/restore API enabled; no schema change.
        upgrade_mod_savepoint(true, 2026032811, 'slideshow');
    }

    return true;
}
