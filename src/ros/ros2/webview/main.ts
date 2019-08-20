// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

namespace ros2monitor {
    function removeAllChildElements(e) {
        while (e.firstChild) {
            e.removeChild(e.firstChild);
        }
    };

    function generateNamesAndTypesTable(tuples) {
        let t = document.createElement("table");
        let th = document.createElement("thead");
        let headerRow = document.createElement("tr");
        let headers = [
            "Name",
            "Type"
        ];
        headers.forEach((name, _i) => {
            let h = document.createElement("th");
            h.appendChild(document.createTextNode(name));
            headerRow.appendChild(h);
        });

        th.appendChild(headerRow);
        t.appendChild(th);

        let tb = document.createElement("tbody");
        for (let i in tuples) {
            let tuple = tuples[i];
            let r = document.createElement("tr");
            let name = document.createElement("td");
            name.appendChild(document.createTextNode(tuple[0]));

            let type = document.createElement("td");
            type.appendChild(document.createTextNode(tuple[1]));

            r.appendChild(name);
            r.appendChild(type);
            tb.appendChild(r);
        }
        t.appendChild(tb);

        return t;
    }

    export function initializeRos2Monitor() {
        // handle message passed from extension to webview
        window.addEventListener("message", (event) => {
            const message = event.data;

            const coreStatus = document.getElementById("ros-status");
            const topicsElement = document.getElementById("topics");
            const servicesElement = document.getElementById("services");

            removeAllChildElements(topicsElement);
            removeAllChildElements(servicesElement);

            if (message.ready) {
                coreStatus.textContent = "online";

                //const nodes = JSON.parse(message.nodes);
                const topics = JSON.parse(message.topics);
                const services = JSON.parse(message.services);

                const topicsHeader = document.createElement("h2");
                topicsHeader.appendChild(document.createTextNode("Topics"));
                topicsElement.appendChild(topicsHeader);
                topicsElement.appendChild(generateNamesAndTypesTable(topics));

                const servicesHeader = document.createElement("h2");
                servicesHeader.appendChild(document.createTextNode("Services"));
                servicesElement.appendChild(servicesHeader);
                servicesElement.appendChild(generateNamesAndTypesTable(services));
            }
            else {
                coreStatus.textContent = "offline";
            }
        });
    };
}

window.onload = () => ros2monitor.initializeRos2Monitor();
