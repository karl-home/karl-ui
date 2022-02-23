export module LegendHTML {
    function genSVGArrow(
        color: string,
        dashed: boolean,
        double: boolean,
        start: string,
        end: string,
        urlName: string,
        markerID: string,
        doubleMarkerID: string,
    ): SVGElement{

        let line = document.createElementNS(svgURL, "line")
        line.setAttribute("x1", "0")
        if (double) {
            line.setAttribute("x1", "100")
        }
        line.setAttribute("y1", "50")
        line.setAttribute("x2", "250")
        line.setAttribute("y2", "50")
        line.setAttribute("stroke", color)
        line.setAttribute("stroke-width", "8")
        line.setAttribute("marker-end", urlName)

        if (dashed) {
            line.setAttribute("stroke-dasharray", "30")
        } else if (double) {
            line.setAttribute("marker-end", end)
            line.setAttribute("marker-start", start)
        }

        let polygon = document.createElementNS(svgURL, "polygon")
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7")

        let startPolygon = document.createElementNS(svgURL, "polygon")
        let endPolygon= document.createElementNS(svgURL, "polygon")

        if (double) {
            startPolygon.setAttribute("fill", color)
            startPolygon.setAttribute("points", "10 0, 10 7, 0 3.5")

            endPolygon.setAttribute("fill", color)
            endPolygon.setAttribute("points", "0 0, 10 3.5, 0 7")
        }

        let startMarker = document.createElementNS(svgURL, "marker")
        let endMarker = document.createElementNS(svgURL, "marker")

        if (double) {

            startMarker.id = markerID
            endMarker.id = doubleMarkerID

            startMarker.setAttribute("markerWidth", "10")
            startMarker.setAttribute("markerHeight", "7")
            startMarker.setAttribute("refX", "10")
            startMarker.setAttribute("refY", "3.5")
            startMarker.setAttribute("fill", color)
            startMarker.setAttribute("orient", "auto")

            endMarker.setAttribute("markerWidth", "10")
            endMarker.setAttribute("markerHeight", "7")
            endMarker.setAttribute("refX", "0")
            endMarker.setAttribute("refY", "3.5")
            endMarker.setAttribute("fill", color)
            endMarker.setAttribute("orient", "auto")

        }

        let marker = document.createElementNS(svgURL, "marker")
        marker.id = markerID
        marker.setAttribute("markerWidth", "10")
        marker.setAttribute("markerHeight", "7")
        marker.setAttribute("refX", "0")
        marker.setAttribute("refY", "3.5")
        marker.setAttribute("fill", color)
        marker.setAttribute("orient", "auto")

        let defs = document.createElementNS(svgURL, "defs")

        // generate arrow
        let arrowSVG = document.createElementNS(svgURL, "svg") 
        arrowSVG.setAttribute("width", "100")
        arrowSVG.setAttribute("height", "40")
        arrowSVG.setAttribute("viewBox", "0 0 350 100")

        // appending 
        arrowSVG.appendChild(defs)
        if (double) {
            defs.appendChild(startMarker)
            defs.appendChild(endMarker)

            startMarker.appendChild(startPolygon)
            endMarker.appendChild(endPolygon)
        } else {
            defs.appendChild(marker)
            marker.appendChild(polygon)
        }
       
        arrowSVG.appendChild(line)

        return arrowSVG
    }
    const svgURL = "http://www.w3.org/2000/svg"

    function getTableElement(arrowName: string) {
        let arrow = genSVGArrow("#2196f3", false, false, "n/a", "n/a",
            "url(#legend-stateless)", "legend-stateless", "n/a") // default is stateless arrow

        if (arrowName == "dataStateful") {
            arrow = genSVGArrow("#2196f3", true, false, "n/a", "n/a",
                "url(#legend-stateful)", "legend-stateful", "n/a")
        } else if (arrowName == "state") {
            arrow = genSVGArrow("red", false, false, "n/a", "n/a",
                "url(#legend-state)", "legend-state", "n/a")
        } else if (arrowName == "network") {
            arrow = genSVGArrow("#71c94f", false, true,
                "url(#legend-network-start)", "url(#legend-network-end)",
                "n/a", "legend-network-start", "legend-network-end")
        }

        return arrow 
    }

    function getTableText(elemName: string) {
        let td = document.createElement("td")

        if (elemName == "dataStateless") {
            td.innerText="Data (stateless)"
        } else if (elemName == "dataStateful") {
            td.innerText="Data (stateful)"
        } else if (elemName == "state") {
            td.innerText="#State"
        } else if (elemName == "network") {
            td.innerText="Network"
        } else if(elemName == "clock") {
            td.innerText="Time"
        } else if (elemName == "module") {
            td.innerText="Module"
        } else {
            td.innerText="Sensor"
        }

        return td
    }



    function appendArrow(arrowName: string) {
        let td = document.createElement("td")

        let element = getTableElement(arrowName)

        td.appendChild(element)

        return td
    }

    function appendTableElement(elemName: string) {
        let td = document.createElement("td")
        let color = "transparent"

        if (elemName == "sensor") {
            color = "#777"
        }

        let svg = document.createElementNS(svgURL, "svg")
        svg.setAttribute("viewBox", "0 0 220 100")
        svg.setAttribute("xmlns", svgURL)

        let rect = document.createElementNS(svgURL, "rect")
        rect.setAttribute("x", "35")
        rect.setAttribute("y", "5")
        rect.setAttribute("width", "150")
        rect.setAttribute("height", "90")
        rect.setAttribute("stroke", "black")
        rect.setAttribute("fill", color)
        rect.setAttribute("stroke-width", "3")

        svg.appendChild(rect)
        td.appendChild(svg)

        return td
    }

    function appendIMG() {
        let td = document.createElement("td")
        const img = new Image()
        img.src = require('./img/clock.png')
        img.setAttribute("height", "40")
        img.setAttribute("weight", "40")
        img.setAttribute("style", "float:center;margin:0px 20px")

        td.appendChild(img)

        return td
    }

     export function initialize() {
        let table = document.getElementById("legend-table")
        let tbody = document.createElement("tbody")
        let trTop = document.createElement("tr")
        let trBottom = document.createElement("tr")
        let trTime = document.createElement("tr")
        let trBox = document.createElement("tr")

        trTop.appendChild(appendArrow("dataStateless"))
        trTop.appendChild(getTableText("dataStateless"))
        trTop.appendChild(appendArrow("state"))
        trTop.appendChild(getTableText("state"))

        trBottom.appendChild(appendArrow("dataStateful"))
        trBottom.appendChild(getTableText("dataStateful"))
        trBottom.appendChild(appendArrow("network"))
        trBottom.appendChild(getTableText("network"))

        trBox.appendChild(appendTableElement("module"))
        trBox.appendChild(getTableText("module"))
        trBox.appendChild(appendTableElement("sensor"))
        trBox.appendChild(getTableText("sensor"))

        trTime.appendChild(appendIMG())
        trTime.appendChild(getTableText("clock"))

        table.appendChild(tbody)
        tbody.appendChild(trTop)
        tbody.appendChild(trBottom)
        tbody.appendChild(trBox)
        tbody.appendChild(trTime)
        
        return table
    }
}
