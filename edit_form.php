<?php

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
 * Slide configuration form
 *
 * @package     mod_slideshow
 * @copyright   2024 Josemaria Bolanos <admin@mako.digital>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once($CFG->dirroot.'/course/moodleform_mod.php');
require_once($CFG->dirroot.'/mod/slideshow/locallib.php');
require_once($CFG->libdir.'/filelib.php');

class mod_slideshow_slide_edit_form extends moodleform {
    function definition() {
        global $CFG, $DB;

        $mform = $this->_form;
        $customdata = $this->_customdata;
        $context = $customdata['context'];
        $cm = $customdata['cm'];

        $mform->addElement('header', 'contentsection', get_string('contentheader', 'slideshow'));
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'48'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');

        $mform->addElement('editor', 'content_editor', get_string('content', 'slideshow'), null, slideshow_get_editor_options($context));
        $mform->addRule('content_editor', get_string('required'), 'required', null, 'client');

        $this->add_action_buttons();

        $mform->addElement('hidden', 'id');
        $mform->setType('id', PARAM_INT);

        $mform->addElement('hidden', 'slideshow');
        $mform->setType('slideshow', PARAM_INT);
        $mform->setDefault('slideshow', $cm->id);

        $mform->addElement('hidden', 'hidden');
        $mform->setType('hidden', PARAM_INT);
        $mform->setDefault('hidden', 0);
    }
}
