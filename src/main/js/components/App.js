import React, { Component } from "react";
import "./App.css";
import VersionsMeasuresHistoryApp from "./VersionsMeasuresHistoryApp";
import { rgbColors, getProjectsLOC, getStored, getKeys } from "../api";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  componentDidMount() {
    this.setState({ loading: true });
    getStored().then((response) => {
      response.sort((a, b) => a.name.localeCompare(b.name));
      this.setState({
        projectData: response
      });
      this.setState({ loading: false });
    });
    getProjectsLOC().then(response => {
      this.setState({
        projectLOC: response
      });
    });
    getKeys().then(response => {
      const mapping = response.find((mapping) => mapping.key === this.props.project.key);
      this.setState({projectName: mapping.name})
    })
  }

  render() {
    const data = this.state.projectData;
    const projectLOC = this.state.projectLOC;
    const loading = this.state.loading;
    const projectName = this.state.projectName;
    return (
      <div className="App container">
        {loading ?
          <div>
            <p>Getting data from Github</p>
            <div className="spinner-border" role="status"/>
          </div>
          : ""
        }
        {data && projectLOC && !loading && projectName ?
          <VersionsMeasuresHistoryApp
            projectData={data.filter((project) => project.name === projectName)}
            projectLOC={projectLOC}
            colors={rgbColors(20)}
          /> : ""
        }
      </div>
    );
  }
}

export default App;
