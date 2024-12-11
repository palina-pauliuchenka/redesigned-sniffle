import React, { Component } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
    }

    setData = (data) => {
        this.setState({ data });
    };

    render() {
        return (
            <div>
                <nav style={{backgroundColor: "#f0f0f0", padding: 20}}>
                    <h1>CS450 - Assignment 7</h1>
                    <h2>Upload a JSON File</h2>
                    <FileUpload setData={this.setData} />
                </nav>

                <main style={{padding: 20}}>
                    <Dashboard data={this.state.data} />
                </main>
            </div>
        );
    }
}

export default App;
