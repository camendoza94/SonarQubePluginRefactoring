/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import MeasuresHistory from './MeasuresHistory'
import {translate} from '../common/l10n.js'
import {findVersionsAndMeasures, findProjects} from '../api.js'
import {Line} from 'react-chartjs-2';

const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'My First dataset',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40]
        }
    ]
};

export default class VersionsMeasuresHistoryApp extends React.PureComponent {

  state = {
    data: []
  };

  componentDidMount() {
    /*findVersionsAndMeasures(this.props.project).then(
      (valuesReturnedByAPI) => {
        this.setState({
          data: valuesReturnedByAPI
        });
      }
    );*/
    findProjects().then(
        (projectData) => {
          this.setState({
              data: projectData
          });
        }
    );
  }

  render() {
    // Data Gathered: {JSON.stringify(this.state.data)}
    return (
      <div className="page page-limited">
          <Line data={data} />
        <table className="data zebra">
          <thead><tr className="code-components-header">
            <th className="thin nowrap text-left code-components-cell">Version</th>
            <th className="thin nowrap text-right code-components-cell">Architectural debt</th>

            <th className="thin nowrap text-center code-components-cell">Quality Gate</th>

            <th className="thin nowrap text-right code-components-cell">{translate('issue.type.BUG.plural')}</th>
            <th className="thin nowrap text-right code-components-cell">Reliability Rating</th>

            <th className="thin nowrap text-right code-components-cell">Vulnerabilities</th>
            <th className="thin nowrap text-right code-components-cell">Security Rating</th>

            <th className="thin nowrap text-right code-components-cell">Code Smells</th>
            <th className="thin nowrap text-right code-components-cell">Maintainability Rating</th>
          </tr></thead>
          <tbody>
          {this.state.data.map(
              (value,idx) =>
              <MeasuresHistory
                measure={value}
                key={idx}
              />
              )
          }
          </tbody>
        </table>
      </div>
    );
  }
}
