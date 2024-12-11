import React, { Component } from 'react';

class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
        };
    }

    handleFileChange = (event) => {
        const file = event.target.files[0];
        this.setState({ file });
    };

    handleFileSubmit = (event) => {
        event.preventDefault();
        const { file } = this.state;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const json = JSON.parse(e.target.result);
                console.log("Parsed Data:", json);
                this.props.setData(json);
            };
            reader.readAsText(file);
        }
    };

    render() {
        return (
            <div>
                <form onSubmit={this.handleFileSubmit}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={this.handleFileChange}
                    />
                    <button type="submit">Upload JSON</button>
                </form>
            </div>
        );
    }
}

export default FileUpload;
