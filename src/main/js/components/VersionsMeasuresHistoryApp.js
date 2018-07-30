/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import {findProjects, findIssuesStatistics} from '../api.js'
import {Line, Doughnut} from 'react-chartjs-2';

export default class VersionsMeasuresHistoryApp extends React.PureComponent {

    state = {
        options: {},
        issues: {},
        data: []
    };

    static getRandomColor() {
        const letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    componentDidMount() {
        findProjects().then(
            (projectData) => {
                let data = {
                    labels: ['Entrega 1', 'Entrega 2', 'Entrega 3'],
                    datasets: []
                };
                const options = {
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Architectural debt (minutes)"
                            }
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Programming assignments'
                            }
                        }]
                    }
                };
                for (let i = 0; i < projectData.length; i++) {
                    console.log(projectData[i]);
                    let color = VersionsMeasuresHistoryApp.getRandomColor();
                    data.datasets.push({
                        label: projectData[i].name,
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: color,
                        borderColor: color,
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: color,
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: projectData[i].data.map((version) => {
                                return version.arch_debt
                            }
                        )
                    });
                }
                this.setState({
                    data: data,
                    options: options
                });
            }
        );

        findIssuesStatistics().then((issues) => {
            const rules = issues.facets[0].values;
            const labels = rules.map((issue) => issue.val);
            const counts = rules.map((issue) => issue.count);
            let backgroundColors = [];
            for (let i = 0; i < rules.length; i++) {
                backgroundColors.push(VersionsMeasuresHistoryApp.getRandomColor())
            }
            let stats = {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: backgroundColors
                }]
            };
            this.setState({
                issues: stats
            });
        });
    }

    render() {
        return (
            <div className="page page-limited">
                <Doughnut data={this.state.issues}/>
                <h1>Architectural debt in group assignments throughout the semester</h1>
                <Line data={this.state.data} options={this.state.options}/>
            </div>
        );
    }
}
