/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import {getJSON} from 'sonar-request'; // see https://github.com/SonarSource/sonarqube/blob/master/server/sonar-web/src/main/js/app/utils/exposeLibraries.js

export function findIssuesStatistics(project) {
    return getJSON('/api/issues/search', {
        facets: 'rules',
        tags:  'refactoring',
        additionalFields: 'rules'
    }).then(function (response) {
        return response;
    });
}


export function findProjects() {
    return getJSON('/api/projects/search').then(function (response) {
        const numProjects = response.components.length;
        if (numProjects > 0) {
            let projectData = [];
            return (async function loop() {
                for (let i = 0; i < numProjects; i++) {
                    let project = response.components[i];
                    let measures = await findVersionsAndMeasures(project);
                    projectData[i] = {
                        name: project.name,
                        data: measures
                    };
                }
                return projectData;
            })();
        }
    });
}

export function findVersionsAndMeasures(project) {

    return getJSON('/api/project_analyses/search', {
        project: project.key,
        p: 1,
        ps: 500,
    }).then(function (responseAnalyses) {
        const numberOfAnalyses = responseAnalyses.analyses.length;
        if (numberOfAnalyses > 0) {

            return getJSON('/api/measures/search_history', {
                component: project.key,
                metrics: "alert_status,bugs,vulnerabilities,code_smells,reliability_rating,security_rating,sqale_rating,arch-debt",
                ps: 1000
            }).then(function (responseMetrics) {
                let data = [];
                let numberOfVersions = 0;

                for (let i = 0; i < numberOfAnalyses; i++) {
                    let analysis = responseAnalyses.analyses[i];
                    for (let j = 0; j < analysis.events.length; j++) {
                        if (analysis.events[j].category === "VERSION") {
                            let result = {
                                version: analysis.events[j].name,
                                alert_status: "",
                                bugs: "0", vulnerabilities: "0", code_smells: "0",
                                reliability_rating: "", security_rating: "", sqale_rating: "", arch_debt: ""
                            };
                            const numberOfMeasuresRetrieved = 7;

                            for (let k = 0; k < numberOfMeasuresRetrieved; k++) {
                                for (let d = 0; d < responseMetrics.measures[k].history.length; d++) {
                                    if (responseMetrics.measures[k].history[d].date === responseAnalyses.analyses[i].date) {
                                        //console.log(responseMetrics.measures[k].metric);
                                        if (responseMetrics.measures[k].metric === "bugs") {
                                            result.bugs = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "vulnerabilities") {
                                            result.vulnerabilities = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "code_smells") {
                                            result.code_smells = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "alert_status") {
                                            result.alert_status = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "reliability_rating") {
                                            result.reliability_rating = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "security_rating") {
                                            result.security_rating = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "sqale_rating") {
                                            result.sqale_rating = responseMetrics.measures[k].history[d].value;
                                        } else if (responseMetrics.measures[k].metric === "arch-debt") {
                                            result.arch_debt = responseMetrics.measures[k].history[d].value;
                                        }
                                    }
                                }
                            }

                            data[numberOfVersions] = result;
                            numberOfVersions++;
                        }
                    }
                }
                //console.table(data);
                return data;
            });
        }
    });
}
