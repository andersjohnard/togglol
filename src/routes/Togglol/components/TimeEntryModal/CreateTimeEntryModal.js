/* @flow */
import React from 'react'

import moment from 'moment';
require("moment-duration-format");

import Modal from 'react-modal';

import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';

import ProjectSelector from './ProjectSelector'

var LocalStorageMixin = require('react-localstorage'); 

var timeFormat = 'HH:ss';
const LAST_PROJECT_KEY = "togglol-last-project";

class CreateTimeEntryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
         entryId: undefined,
         startDate: undefined,
         endDate: undefined,
         projectId: this.getLastProjectId(),
         description: undefined,
         isModalOpen: false
    }
  }

    showModal(slotInfo) {
        var startDate = moment(slotInfo.start);
        var endDate = moment(slotInfo.end);

        var projectId = slotInfo.projectId || this.getLastProjectId();
        
        this.setState({
            startDate: startDate,
            endDate: endDate,
            entryId: slotInfo.entryId,
            projectId: projectId,
            description: slotInfo.description
        });

        if(this.props.shiftKeyPressed && this.state.projectId > 0) {
            this.createTimeEntry();
        } else {
            this.setState({isModalOpen: true});
        }
        
    }

    getLastProjectId() {
        return Number(localStorage.getItem(LAST_PROJECT_KEY));
    }

    hideModal(){
        this.setState({isModalOpen: false});
    }

    changeStartTime(value) {
        var startDate = moment(value);
        this.setState({startDate: startDate});
    }


    changeEndTime(value) {
        var endDate = moment(value);
        this.setState({endDate: endDate});
    }

    changeDescription(value) {
        this.setState({description: value});
    }

    changeSelectedProject(projectId) {
        this.setState({projectId: projectId});
        this.submitButton.focus();
    }

    createTimeEntry() {
        var timeEntry = {
            id: this.state.entryId,
            description: this.state.description,
            pid: this.state.projectId,
            start: this.state.startDate.toISOString(),
            duration: this.state.endDate.diff(this.state.startDate, 'seconds'),
            created_with: "Togglol"
        };
        localStorage.setItem(LAST_PROJECT_KEY, this.state.projectId);
        this.hideModal();
        this.props.onCreateTimeEntry(timeEntry);
    }

    deleteTimeEntry() {
        var entryId = this.state.entryId;
        this.hideModal();
        this.props.onDeleteTimeEntry(entryId);
    }

    isEditMode() {
        return this.state.entryId != undefined;
    }

    render() {
        var duration = (this.state.startDate != undefined && this.state.endDate != undefined) ? moment.duration(this.state.endDate.diff(this.state.startDate)).format("h [hrs], m [min]") : "";
        let footerExtras = (<p className="float-xs-left" style={{float:'left'}}><small>Tip: Hold <kbd>shift</kbd> when creating a time entry to automatically use the last added project</small></p>)
        if(this.isEditMode()) {
            footerExtras = (<button type="button" style={{float: 'left'}} className="float-xs-left btn btn-danger" onClick={(e) => this.deleteTimeEntry(e)}>Delete entry</button>);
        }

        return(
            <Modal 
                className="Modal__Bootstrap modal-dialog"
                isOpen={this.state.isModalOpen} 
                onRequestClose={(e) => this.hideModal(e)}
                >
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={() => this.hideModal()}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h4 className="modal-title">{this.isEditMode() ? 'Edit time entry' : 'Add time entry'}</h4>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group row">
                                <label className="col-sm-2 col-form-label">Time </label>
                                <div className="col-sm-10">
                                    <p className="form-control-static">
                                        <TimePicker style={timepickerStyle} value={this.state.startDate} onChange={(value) => this.changeStartTime(value)} showSecond={false} />&nbsp;-&nbsp;
                                        <TimePicker style={timepickerStyle} value={this.state.endDate} onChange={(value) => this.changeEndTime(value)} showSecond={false} />
                                        &nbsp;({duration})
                                    </p>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-2 col-form-label">Description </label>
                                <div className="col-sm-10">
                                    <p className="form-control-static">
                                        <input type="text" value={this.state.description} className="form-control" onChange={(event) => this.changeDescription(event.target.value)}/>    
                                    </p>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-2 col-form-label">Project</label>
                                <div className="col-sm-10">
                                    <ProjectSelector selectedProject={this.state.projectId} onChange={(project) => this.changeSelectedProject(project)} clients={this.props.clients} projects={this.props.projects} />
                                </div>
                            </div>
                        </form>
                        
                    </div>
                    <div className="modal-footer">
                        {footerExtras}
                        <button className="btn btn-secondary" onClick={() => this.hideModal()}>Cancel</button>&nbsp;
                        <button type="button" ref={(ref) => this.submitButton = ref} className="btn btn-primary" onClick={(e) => this.createTimeEntry(e)}>{this.isEditMode() ? 'Save entry' : 'Create entry'}</button>
                    </div>
                    </div>
            </Modal>
            );
    }
}

CreateTimeEntryModal.propTypes = {
  clients: React.PropTypes.array.isRequired,
  projects: React.PropTypes.array.isRequired,
  shiftKeyPressed: React.PropTypes.bool.isRequired
};

// Style
var contentStyle = {
    padding: '10px'
}

var timepickerStyle = {
    borderRadius: '.25rem'
}

export default CreateTimeEntryModal

