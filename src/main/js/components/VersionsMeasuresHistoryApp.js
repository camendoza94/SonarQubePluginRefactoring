import React from 'react';
import {Doughnut, Line} from 'react-chartjs-2';
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
            issuesData: [],
            issuesLabels: [],
            issuesHistory: [],
            projectNames: [],
            projectDataFiltered: this.props.projectData,
            sectionList: [],
            sectionFilter: '',
            legendGroups: {},
            showingGroup: -1,
        };
        this.rules = [];
        this.rules.push("DTOs must implement Serializable");
        this.rules.push("DTOs must have an empty constructor for serializing");
        this.rules.push("DTOs must have only serializable fields");
        this.rules.push("All fields on DTOs must have getters and setters");
        this.rules.push("DTOs must have a constructor with an Entity as a parameter");
        this.rules.push("toEntity methods in DTOs must convert the object to an Entity");
        this.rules.push("Fields on DetailDTOs must be of type DTO or List");
        this.rules.push("DetailTOs must have a constructor with an Entity as a parameter");
        this.rules.push("toEntity methods in DetailDTOs must convert the object to an Entity");
        this.rules.push("Resource classes must have a Path annotation");
        this.rules.push("Resource classes must have a Consumes annotation");
        this.rules.push("Resource classes must have a Produces annotation");
        this.rules.push("Resource classes must have a logic injection as a field");
        this.rules.push("Logic layer classes must be annotated with Stateless");
        this.rules.push("Logic classes must have a persistence injection as a field");
        this.rules.push("Resource methods must check for existence of entity and throw WebApplicationException in case");
        this.rules.push("Resource GET methods must return DetailDTOs so their info is properly displayed");
        this.rules.push("Getters and setters on DTOs must manage serializable types only");

        this.lastReview = 4;

        this.handleFilterBySection = this.handleFilterBySection.bind(this);
    }

    componentDidMount() {
        this.renderHistory();
        this.renderIssues();
        this.renderIssuesHistory();
        const projectNames = this.props.projectData.map((project) => project.name);
        let sections = projectNames.map((name) => name.substr(0, 2));
        sections = sections.filter((section, index, array) => array.indexOf(section) === index);
        this.setState({
            projectNames: projectNames,
            sectionList: sections,
            sectionFilter: sections,
        }, this.renderGroupState)
    }

    renderGroupState() {
        let counts = [];
        let rulesCounts = [];
        for (let i = 0; i < this.state.projectDataFiltered.length; i++) {
            counts[i] = this.state.projectDataFiltered[i].data.filter((issue) => {
                return issue.labels.map(l => l.name).includes("C" + this.lastReview)
            }).length;
            rulesCounts[i] = [];
            for (let j = 0; j < this.rules.length; j++) {
                rulesCounts[i][j] = this.state.projectDataFiltered[i].data.filter((issue) => {
                    return issue.labels.map(l => l.name).includes("C" + this.lastReview) && issue.labels.map(l => l.name).includes("R" + (j + 1));
                }).length;
            }
        }
        this.setState({
            groupStats: counts,
            rulesCount: rulesCounts
        });

    }

    renderIssuesHistory() {
        let data = {
            labels: [],
            datasets: []
        };
        for (let i = 0; i < this.lastReview; i++) {
            data.labels.push("Release " + (i + 1))
        }
        const options = {
            responsive: true,
            tooltips: {
                mode: 'label'
            },
            elements: {
                line: {
                    fill: false
                }
            },
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
        let counts = [];
        for (let i = 0; i < this.state.projectDataFiltered.length; i++) {
            for (let k = 1; k <= this.lastReview; k++) {
                for (let j = 0; j < this.rules.length; j++) {
                    counts[j] = counts[j] ? counts[j] : new Array(this.lastReview).fill(0);
                    counts[j][k - 1] += this.state.projectDataFiltered[i].data.filter((issue) => {
                        return issue.labels.map(l => l.name).includes("R" + (j + 1)) && issue.labels.map(l => l.name).includes("C" + k)
                    }).length
                }
            }
        }
        let i = 0;
        this.rules.forEach((name) => {
            let color = this.props.colors[i];
            data.datasets.push({
                label: name,
                fill: false,
                lineTension: 0,
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
                data: counts[i]
            });
            i++;
        });
        this.setState({
            dataIssues: data,
            optionsIssues: options
        });
    }

    renderIssues() {
        let counts = new Array(20).fill(0);
        for (let i = 0; i < this.state.projectDataFiltered.length; i++) {
            for (let j = 0; j < this.rules.length; j++) {
                counts[j] += this.state.projectDataFiltered[i].data.filter((issue) => {
                    return issue.labels.map(l => l.name).includes("R" + (j + 1)) && issue.labels.map(l => l.name).includes("C" + this.lastReview)
                }).length
            }
        }
        let backgroundColors = [];
        for (let i = 0; i < this.rules.length; i++) {
            backgroundColors.push(this.props.colors[i])
        }
        let stats = {
            labels: this.rules,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors
            }]
        };
        this.setState({
            issues: stats
        });
    }

    renderHistory() {
        let data = {
            labels: [],
            datasets: []
        };
        for (let i = 0; i < this.lastReview; i++) {
            data.labels.push("Release " + (i + 1))
        }
        const options = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Issue density per 1K LOC'
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
        for (let i = 0; i < this.state.projectDataFiltered.length; i++) {
            let color = this.props.colors[i];
            let dataHistory = [];
            for (let j = 1; j <= this.lastReview; j++) {
                dataHistory[j - 1] = this.state.projectDataFiltered[i].data.filter((issue) => {
                    return issue.labels.map(i => i.name).includes("C" + j)
                }).length
            }
            let projects = this.props.projectLOC.filter((data) => {
                return data.name === this.state.projectDataFiltered[i].name;
            });
            let countsLOC = (projects[0] ? projects[0].locs : new Array(this.lastReview).fill(0));
            let result = dataHistory.map((n, i) => (n / countsLOC[i]) * 1000);
            data.datasets.push({
                label: this.state.projectDataFiltered[i].name,
                fill: false,
                lineTension: 0,
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
                data: result
            });
        }
        this.setState({
            data: data,
            options: options
        });
    }

    handleFilterBySection(inputValue) {
        this.setState({sectionFilter: inputValue.value}, this.filter);
    }

    filter() {
        if (this.state.sectionFilter === 'clear') {
            return this.setState({projectDataFiltered: this.props.projectData}, this.renderHistory);
        }
        let names = this.state.projectNames.filter(name => {
            return this.state.sectionFilter.includes(name.substr(0, 2))
        }, this);

        const newData = this.props.projectData.filter(project => names.includes(project.name)
        );

        this.setState({projectDataFiltered: newData}, this.renderHistory);
    }

    sectionListFormatter() {
        return [{'value': 'clear', 'label': 'All'}].concat(this.state.sectionList.map(section => {
            return {'value': section, 'label': section}
        }))
    }

    showGroupInfo(index) {
        this.setState({
            showingGroup: index
        })
    }

    render() {
        const groups = this.state.groupStats;
        const groupInfo = this.state.showingGroup;
        return (
            <div className="page page-limited">
                <h1>Architectural debt in group assignments</h1>
                <br/>
                <div className="container">
                    <div className="row">
                        {groups ?
                            <div className="col">
                                <table className="table">
                                    <thead className="thead-light">
                                    <tr>
                                        <th scope="col">Group</th>
                                        <th scope="col">Number of violations in latest release</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {groups.map((group, index) => {
                                        return <tr key={index}>
                                            <th scope="row"
                                                onClick={this.showGroupInfo.bind(this, index)}>{this.state.projectNames[index]}</th>
                                            <td>{group}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                            </div> : ''
                        }
                        {groupInfo !== -1 ?
                            <div className="col">
                                <h3>{"Violations info for group " + this.state.projectNames[groupInfo]}</h3>
                                <table className="table">
                                    <thead className="thead-light">
                                    <tr>
                                        <th scope="col">Rule</th>
                                        <th scope="col">Number of violations in latest release</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.rulesCount[groupInfo].map((issue, index) => {
                                        return <tr>
                                            <th scope="row"><a target="_blank noopener noreferer"
                                                               href={"https://archtoringkb.herokuapp.com/#collapse" + index}>{this.rules[index]}</a>
                                            </th>
                                            <td>{issue}</td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                            </div> : ''
                        }
                    </div>
                </div>
                <br/>
                <h3>Sections</h3>
                <Select
                    name="sections"
                    options={this.sectionListFormatter()}
                    onChange={this.handleFilterBySection}
                    placeholder="Select section"
                />
                <br/>
                <h1>Issue density in group assignments throughout the semester</h1>
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