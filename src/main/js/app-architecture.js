import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import VersionsMeasuresHistoryApp from './components/VersionsMeasuresHistoryApp';
import './style.css';
import {findProjects} from "./api";

window.registerExtension('refactoring/architecture', options => {

    const {el} = options;
    let defProps = [];
    (async function find() {
        defProps = await findProjects();
        render(
            <VersionsMeasuresHistoryApp
                projectData={defProps}
            />, el
        );
    })();

    return () => unmountComponentAtNode(el);
});
