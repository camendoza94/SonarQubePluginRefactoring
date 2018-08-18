/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import {findIssuesStatistics, findProjectsNames} from '../api.js'
import {Line, Doughnut} from 'react-chartjs-2';
import {CSVLink} from 'react-csv';


const headers = ['rule', 'number of issues'];
const headersHistory = ['group', 'first assignment', 'second assignment', 'third assignment'];

class VersionsMeasuresHistoryApp extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            options: {},
            issues: {},
            data: [],
            csvData: [],
            csvHistory: [],
            projectData: [],
            projectNames: [],
            projectDataFiltered: this.props.projectData,
            courseList: [],
            semesterList: [],
            sectionList: [],
            courseFilter: '',
            semesterStartFilter: '0',
            semesterEndFilter: '9999',
            sectionFilter: ''
        };
    }

    static getRandomColor() {
        const letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    renderHistory() {

        console.log('render');
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
        for (let i = 0; i < this.state.projectDataFiltered.length; i++) {
            console.log(this.state.projectDataFiltered[i]);
            let color = VersionsMeasuresHistoryApp.getRandomColor();
            let debt_history = this.state.projectDataFiltered[i].data.map((version) => {
                return version.arch_debt
            });
            let debt_history_array = [this.state.projectDataFiltered[i].name];
            debt_history_array = debt_history_array.concat(debt_history);
            history.push(debt_history_array);
            data.datasets.push({
                label: this.state.projectDataFiltered[i].name,
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

        console.log('finish render');
    }

    componentDidUpdate() {

    }

    componentDidMount() {

        console.log('mounted');
        console.log(this.state.projectDataFiltered);
        this.renderHistory();

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
            const projectNames = projectData.map((project) => project.name);
            let courses = projectNames.map((name) => name.substr(0, 7));
            courses = courses.filter((course, index, array) => array.indexOf(course) === index);
            let semesters = projectNames.map((name) => name.substr(9, 14));
            semesters = semesters.filter((semester, index, array) => array.indexOf(semester) === index);
            let sections = projectNames.map((name) => name.substr(16, 16));
            sections = sections.filter((section, index, array) => array.indexOf(section) === index);
            this.setState({
                courseList: courses,
                projectNames: projectNames,
                semesterList: semesters,
                sectionList: sections
            })
        })
    }

    filterBySemester() {
        const newData = this.props.projectData.filter((project) => {
            let sem = project.name.substr(9, 14);
            return sem >= this.state.semesterStartFilter && sem <= this.state.semesterEndFilter;
        });
        this.setState({projectDataFiltered: newData}, this.renderHistory);
    }


    handleFilterBySemester(event) {
        if (event.target.name === 'selectSemesterStart') {
            this.setState({semesterStartFilter: event.target.value}, this.filterBySemester);
        } else {
            this.setState({semesterEndFilter: event.target.value}, this.filterBySemester);
        }
    }

    render() {
        return (
            <div className="page page-limited">
                {this.state.courseList.map((course, i) =>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id={'inlineCheckbox' + i} value={course}/>
                        <label className="form-check-label" htmlFor={'inlineCheckbox' + i}>{course}</label>
                    </div>
                )}
                {this.state.sectionList.map((section, i) =>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id={'inlineCheckbox' + i} value={section}/>
                        <label className="form-check-label" htmlFor={'inlineCheckbox' + i}>{section}</label>
                    </div>
                )}
                <select id="selectSemesterStart" name="selectSemesterStart"
                        onChange={(event) => this.handleFilterBySemester(event)}>
                    <option selected disabled>Start semester</option>
                    {this.state.semesterList.map((semester) =>
                        <option>{semester}</option>
                    )}
                </select>
                <select id="selectSemesterEnd" name="selectSemesterEnd"
                        onChange={(event) => this.handleFilterBySemester(event)}>
                    <option selected disabled>End semester</option>
                    {this.state.semesterList.map((semester) =>
                        <option>{semester}</option>
                    )}
                </select>
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

export default VersionsMeasuresHistoryApp;