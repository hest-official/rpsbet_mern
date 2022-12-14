import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { setPasswordCorrect, closeGamePasswordModal } from '../../redux/Notification/notification.actions';
import { checkGamePassword } from '../../redux/Logic/logic.actions';

Modal.setAppElement('#root')

const customStyles = {
    overlay: {
        zIndex: 3,
        backgroundColor: 'rgba(47, 49, 54, 0.8)'
    },
    content: {
        top         : '50%',
        left        : '50%',
        right       : 'auto',
        bottom      : 'auto',
        transform   : 'translate(-50%, -50%)',
        padding: 0,
        background: 'transparent',
        border: 0
    }
}

class GamePasswordModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: ''
        }
    }

    onBtnOkClicked = async (e) => {
        const response = await this.props.checkGamePassword({room_id: this.props.roomId, password: this.state.password});
        if (response === true) {
            this.props.closeGamePasswordModal();
            this.props.setPasswordCorrect(true);
        } else {
            alert("Invalid password! Please try again.");
        }
    }

    onBtnCancelClicked = (e) => {
        this.props.closeGamePasswordModal();
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            style={customStyles}
            contentLabel="Password"
        >
            <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
                <div className='modal-body alert-body password-modal-body'>
                    <button className="btn-close" onClick={this.props.closeGamePasswordModal}>×</button>
                    <div className={`modal-icon result-icon-password`}></div>
                    <h5>This game requires a password!<br/>Enter the game's password.</h5>
                    <input type="password" id="game_password" value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} className="form-control" />
                    <button className="btn-submit" onClick={this.onBtnOkClicked}>Okay</button>
                    <button className="btn-back" onClick={this.props.closeGamePasswordModal}>Cancel</button>
                </div>
            </div>
        </Modal>;
    }
}

const mapStateToProps = state => ({
    isDarkMode: state.auth.isDarkMode,
    isOpen: state.snackbar.showGamePasswordModal,
    title: state.snackbar.title,
    roomStatus: state.snackbar.roomStatus,
    alertMessage: state.snackbar.alertMessage,
    alertType: state.snackbar.alertType,
    socket: state.auth.socket,
    roomId: state.logic.curRoomInfo._id,
});

const mapDispatchToProps = {
    closeGamePasswordModal,
    checkGamePassword,
    setPasswordCorrect
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GamePasswordModal);
