/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import {findProjects, findIssuesStatistics, findProjectsNames} from '../api.js'
import {Line, Doughnut} from 'react-chartjs-2';
import {CSVLink} from 'react-csv';


const headers = ['rule', 'number of issues'];
const headersHistory = ['group', 'first assignment', 'second assignment', 'third assignment'];

export default class VersionsMeasuresHistoryApp extends React.PureComponent {

    state = {
        options: {},
        issues: {},
        data: [],
        csvData: [],
        csvHistory: [],
        projectData: {}
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
                                labelString: 'Architectural debt (minutes)'
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
                let history = [];
                for (let i = 0; i < projectData.length; i++) {
                    console.log(projectData[i]);
                    let color = VersionsMeasuresHistoryApp.getRandomColor();
                    let debt_history = projectData[i].data.map((version) => {
                        return version.arch_debt
                    });
                    let debt_history_array = [projectData[i].name];
                    debt_history_array = debt_history_array.concat(debt_history);
                    history.push(debt_history_array);
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
                        data: debt_history
                    });
                }
                this.setState({
                    data: data,
                    options: options,
                    csvHistory: history
                });
            }
        );

        findIssuesStatistics().then((issues) => {
            const rules = issues.facets[0].values;
            let labels = [];
            let rulesInfo = issues.rules;
            for (let i = 0; i < rules.length; i++) {
                labels.push(rulesInfo.find((rule) => {
                    return rule.key === rules[i].val;
                }).name)
            }
            const counts = rules.map((issue) => issue.count);
            let csv = labels.map((label, i) => {
                return [label, counts[i]];
            });
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
                issues: stats,
                csvData: csv,
            });
        });

        findProjectsNames().then((projectData) => {
            this.setState({
                projectData: projectData
            })
        })
    }

    render() {
        return (
            <div className="page page-limited">
                <Doughnut data={this.state.issues}/>
                {<CSVLink data={this.state.csvData} headers={headers} filename={"IssuesStatistics.csv"}>Download
                    issues data for this period</CSVLink>}
                <h1>Architectural debt in group assignments throughout the semester</h1>
                <Line data={this.state.data} options={this.state.options}/>
                {<CSVLink data={this.state.csvHistory} headers={headersHistory} filename={"GroupsDebtStatistics.csv"}>Download
                    group data</CSVLink>}
            </div>
        );
    }
}
