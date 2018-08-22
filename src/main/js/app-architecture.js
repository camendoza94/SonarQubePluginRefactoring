import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import VersionsMeasuresHistoryApp from './components/VersionsMeasuresHistoryApp';
import './style.css';
import {findProjects, rgbColors} from "./api";

window.registerExtension('refactoring/architecture', options => {

    const {el} = options;
    let defProps = [];
    let defColors = [];
    (async function find() {
        defProps = await findProjects();
        defColors = await rgbColors(16);
        render(
            <VersionsMeasuresHistoryApp
                projectData={defProps}
                colors={defColors}
            />, el
        );
    })();

    return () => unmountComponentAtNode(el);
});
