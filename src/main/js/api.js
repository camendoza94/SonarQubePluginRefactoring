/*
 * Copyright (C) 2017-2017 SonarSource SA
 * All rights reserved
 * mailto:info AT sonarsource DOT com
 */
import {getJSON} from 'sonar-request'; // see https://github.com/SonarSource/sonarqube/blob/master/server/sonar-web/src/main/js/app/utils/exposeLibraries.js

export function findIssuesStatistics(project) {
    return getJSON('/api/issues/search', {
        facets: 'rules',
        tags: 'refactoring',
        additionalFields: 'rules'
    }).then(function (response) {
        return response;
    });
}

export function findIssuesHistory() {
    return getJSON('http://localhost:5000/issues_log').then((response) => {
        console.log(response);
        return response
    })
}

export function findProjectsNames() {
    return getJSON('/api/projects/search').then(function (response) {
            return response.components;
        }
    );
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

export function rgbColors(t) {
    t = parseInt(t);
    if (t < 2)
        throw new Error("'t' must be greater than 1.");

    // distribute the colors evenly on
    // the hue range (the 'H' in HSV)
    const i = 360 / (t - 1);

    // hold the generated colors
    let r = [];
    let sv = 70;
    for (let x = 0; x < t; x++) {
        // alternate the s, v for more
        // contrast between the colors.
        sv = sv > 90 ? 70 : sv + 10;
        r.push(hsvToRgb(i * x, sv, sv));
    }
    return r;
}

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
export function hsvToRgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if (s === 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}
