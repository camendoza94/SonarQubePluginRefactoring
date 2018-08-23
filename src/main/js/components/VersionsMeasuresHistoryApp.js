/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import {findIssuesStatistics, findProjectsNames} from '../api.js'
import {Line, Doughnut} from 'react-chartjs-2';
import Select from 'react-select';


class VersionsMeasuresHistoryApp extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            colors: [],
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
            courseFilter: [],
            semesterStartFilter: '0',
            semesterEndFilter: '9999',
            sectionFilter: ''
        };

        this.handleFilterByCourse = this.handleFilterByCourse.bind(this);
        this.handleFilterBySemesterEnd = this.handleFilterBySemesterEnd.bind(this);
        this.handleFilterBySemesterStart = this.handleFilterBySemesterStart.bind(this);
    }

    renderHistory() {

        console.log("render" + this.state.courseList);
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
            let color = this.props.colors[i];
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
        console.log("render" + this.state.courseList);
        console.log('finish render');
    }

    componentDidMount() {


        console.log("mount" + this.state.courseList);
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
                backgroundColors.push(this.props.colors[i])
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
            let sections = projectNames.map((name) => name.substr(16, 17));
            sections = sections.filter((section, index, array) => array.indexOf(section) === index);
            this.setState({
                courseList: courses,
                projectNames: projectNames,
                semesterList: semesters,
                sectionList: sections,
                courseFilter: courses,
                sectionFilter: sections
            })
        });

        console.log("mount" + this.state.courseList);
    }

    handleFilterBySemesterStart(event) {
        this.setState({semesterStartFilter: event.value}, this.filter);
    }

    handleFilterBySemesterEnd(event) {
        this.setState({semesterEndFilter: event.value}, this.filter);
    }

    handleFilterByCourse(inputValue) {
        this.setState({courseFilter: inputValue.map((array) => array.value)}, this.filter);
    }

    handleFilterBySection(inputValue) {
        this.setState({sectionFilter: inputValue.map((array) => array.value)}, this.filter);
    }

    filter() {
        let names = this.state.projectNames.filter(name => {
            return this.state.courseFilter.includes(name.substr(0, 7));
        }, this);
        names = names.filter(name => {
            let sem = name.substr(9, 14);
            return sem >= this.state.semesterStartFilter && sem <= this.state.semesterEndFilter;
        }, this);
        /*names = names.filter(name => {
            this.state.sectionFilter.includes(name.substr(16, 17))
        }, this);
    */
        const newData = this.props.projectData.filter(project => names.includes(project.name)
        );

        this.setState({projectDataFiltered: newData}, this.renderHistory);
    }

    courseListFormatter() {
        return this.state.courseList.map(course => {
            return {'value': course, 'label': course}
        })
    }

    courseFilterFormatter() {
        return this.state.courseFilter.map(course => {
            return {'value': course, 'label': course}
        })
    }

    sectionListFormatter() {
        return this.state.sectionList.map(section => {
            return {'value': section, 'label': section}
        })
    }

    render() {
        return (
            <div className="page page-limited">
                <h3>Courses</h3>
                <Select
                    isMulti
                    value={this.courseFilterFormatter()}
                    name="courses"
                    options={this.courseListFormatter()}
                    onChange={this.handleFilterByCourse}
                    placeholder="Select courses"
                />
                <h3>Semesters</h3>
                <Select
                    name="semesterStart"
                    options={this.state.semesterList.map(semester => {
                        return {'value': semester, 'label': semester}
                    })}
                    onChange={this.handleFilterBySemesterStart}
                    className="semester-select"
                    placeholder="Select start semester"
                />
                <Select
                    name="semesterEnd"
                    options={this.state.semesterList.map(semester => {
                        return {'value': semester, 'label': semester}
                    })}
                    onChange={this.handleFilterBySemesterEnd}
                    className="semester-select"
                    placeholder="Select end semester"
                />
                <br/>
                <br/>
                <br/>
                <h3>Sections</h3>
                <Select
                    name="sections"
                    options={this.sectionListFormatter()}
                    onChange={this.handleFilterBySection}
                    placeholder="Select section"
                />
                <h1>Architectural debt in group assignments throughout the semester</h1>
                <Line data={this.state.data} options={this.state.options}/>
                <Doughnut data={this.state.issues}/>
            </div>
        );
    }
}

export default VersionsMeasuresHistoryApp;