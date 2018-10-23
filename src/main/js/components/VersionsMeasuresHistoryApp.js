/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import React from 'react';
import {findIssuesStatistics, findProjectsNames, findIssuesHistory} from '../api.js'
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
            dataIssues: [],
            optionsIssues: {},
            csvData: [],
            csvHistory: [],
            issuesData: [],
            issuesLabels: [],
            issuesHistory: [],
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
        this.handleFilterBySection = this.handleFilterBySection.bind(this);
    }

    renderHistory() {
        let data = {
            labels: ['Release 1', 'Release 2', 'Release 3'],
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
    }

    renderIssuesHistory() {
        let data = {
            labels: this.state.issuesLabels,
            datasets: []
        };
        const options = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of violations'
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
        let i = 0;
        this.state.issuesHistory.forEach((value, key) => {
            let color = this.props.colors[i];
            data.datasets.push({
                label: key,
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
                data: value
            });
            i++;
        });
        console.log(data);
        console.log(this.state);
        this.setState({
            dataIssues: data,
            optionsIssues: options
        });
    }

    componentDidMount() {
        this.renderHistory();
        findIssuesHistory().then((response) => {
            this.setState({issuesData: response._items});
            let map_issues = new Map();
            let labels = [];
            response._items.forEach((issues) => {
                let rules = issues.facets[0].values;
                let rulesInfo = issues.rules;
                labels.push(issues.date);
                rules.forEach(rule => {
                    let key = rulesInfo.find((r) => {
                        return r.key === rule.val;
                    }).name;
                    let value = rule.count;
                    let prev_value = map_issues.get(key);
                    if (prev_value) {
                        map_issues.set(key, [...prev_value, value])
                    } else {
                        map_issues.set(key, [value])
                    }
                })
            });
            this.setState({issuesHistory: map_issues, issuesLabels: labels}, this.renderIssuesHistory)
        });

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
            let courses = projectNames.map((name) => name.substr(0, 8));
            courses = courses.filter((course, index, array) => array.indexOf(course) === index);
            let semesters = projectNames.map((name) => name.substr(9, 6));
            semesters = semesters.filter((semester, index, array) => array.indexOf(semester) === index);
            let sections = projectNames.map((name) => name.substr(16, 2));
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
        this.setState({sectionFilter: inputValue.value}, this.filter);
    }

    filter() {
        let names = this.state.projectNames.filter(name => {
            return this.state.courseFilter.includes(name.substr(0, 8));
        }, this);
        names = names.filter(name => {
            let sem = parseInt(name.substr(9, 6));
            return sem >= parseInt(this.state.semesterStartFilter) && sem <= parseInt(this.state.semesterEndFilter);
        }, this);
        names = names.filter(name => {
            return this.state.sectionFilter.includes(name.substr(16, 2))
        }, this);

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
                <br/>
                <h1>Architectural debt in group assignments</h1>
                <Line data={this.state.data} options={this.state.options}/>
                <br/>
                <h1>Most common violations throughout the semester</h1>
                <Line data={this.state.dataIssues} options={this.state.optionsIssues}/>
                <br/>
                <h1>Most common violations in latest release</h1>
                <Doughnut data={this.state.issues}/>
            </div>
        );
    }


}

export default VersionsMeasuresHistoryApp;