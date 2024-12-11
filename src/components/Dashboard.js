import React, { Component } from 'react';
import * as d3 from 'd3';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data || [],  // Initialize with data from props
            colorType: 'sentiment',
            selectedTweets: [],
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.data && this.props.data !== prevProps.data) {
            const trimmedData = this.props.data.slice(0, 300);
            if (trimmedData !== this.state.data) {
                this.setState({ data: trimmedData }, () => this.renderGraph(trimmedData));
            }
        }
    }

    renderGraph = (data) => {
        const svgWidth = 1000;
        const svgHeight = 600;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        d3.select("svg").remove();  // Remove previous SVG elements
        const svg = d3.select("#container")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("margin", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`);

        const months = [...new Set(data.map(d => d.Month))];
        const yScale = d3.scaleBand().domain(months).range([0, height]).padding(0.1);

        const simulation = d3.forceSimulation(data)
            .force('y', d3.forceY(d => yScale(d.Month) + yScale.bandwidth() / 2).strength(5))
            .force('x', d3.forceX(width / 2).strength(0.1))
            .force('collide', d3.forceCollide(10));

        const colors = this.getColors(this.state.colorType);

        const points = svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', d => colors(d.Sentiment))
            .on('click', (event, d) => this.handleClick(event, d));

        simulation.on('tick', () => {
            points
                .attr('cx', d => d.x || 0)
                .attr('cy', d => d.y || 0);
        });

        svg.selectAll('text')
            .data(months)
            .enter()
            .append('text')
            .attr('x', 0)
            .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
            .text(d => d)
            .attr('font-size', '14px')
            .attr('font-weight', 'bold');

        this.updateLegend(colors);
    };

    getColors = (type) => {
        return type === 'sentiment'
            ? d3.scaleLinear().domain([-1, 0, 1]).range(['red', '#ECECEC', 'green'])
            : d3.scaleLinear().domain([0, 1]).range(['#ECECEC', '#4467C4']);
    };

    handleClick = (event, d) => {
        const tweet = d.RawTweet;
        this.setState(prevState => {
            const tweets = prevState.selectedTweets.includes(tweet)
                ? prevState.selectedTweets.filter(t => t !== tweet)
                : [tweet, ...prevState.selectedTweets];

            d3.select(event.target)
                .attr('stroke', tweets.includes(tweet) ? 'black' : '')
                .attr('stroke-width', tweets.includes(tweet) ? 3 : 0);

            return { selectedTweets: tweets };
        }, () => this.updateTweetsDisplay());
    };

    updateTweetsDisplay = () => {
        const { selectedTweets } = this.state;
        d3.select("#tweets").selectAll('*').remove();
        selectedTweets.forEach(tweet => {
            d3.select("#tweets").append("p").text(tweet).style("padding", "5px");
        });
    };

    handleDropdown = (event) => {
        const colorType = event.target.value;
        const colorScale = this.getColors(colorType);

        d3.select("svg")
            .selectAll('circle')
            .transition()
            .duration(500)
            .attr('fill', d => colorType === 'sentiment' ? colorScale(d.Sentiment) : colorScale(d.Subjectivity));

        this.setState({ colorType }, () => this.updateLegend(colorScale));
    };

    updateLegend = (colorScale) => {
        const topLabel = this.state.colorType === 'sentiment' ? "Positive" : "Subjective";
        const bottomLabel = this.state.colorType === 'sentiment' ? "Negative" : "Objective";

        d3.selectAll('.legend').remove();

        const svg = d3.select("svg");
        const width = svg.node().getBoundingClientRect().width;

        const legendWidth = 20;
        const legendHeight = 200;
        const legendX = width - 100;
        const legendY = 100;

        const defs = svg.append('defs').attr('class', 'legend');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'sentimentGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colorScale(1));
        linearGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', colorScale(0));
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colorScale(-1));

        svg.append('rect')
            .attr('class', 'legend')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#sentimentGradient)');

        svg.append('text')
            .attr('class', 'legend')
            .attr('x', legendX + legendWidth)
            .attr('y', legendY)
            .attr('text-anchor', 'start')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .text(topLabel);

        svg.append('text')
            .attr('class', 'legend')
            .attr('x', legendX + legendWidth)
            .attr('y', legendY + legendHeight + 20)
            .attr('text-anchor', 'start')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .text(bottomLabel);
    };

    render() {
        return (
            <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <p style={{ fontWeight: "bold", fontSize: "14px", marginRight: "1rem" }}>Color By:</p>
                    <select value={this.state.colorType} onChange={this.handleDropdown}>
                        <option value="sentiment">Sentiment</option>
                        <option value="subjectivity">Subjectivity</option>
                    </select>
                </div>
                <div id='container'></div>
                <div id='tweets'>
                    {this.state.selectedTweets.length > 0 && (
                        <div>
                            <h3>Selected Tweets:</h3>
                            <ul>
                                {this.state.selectedTweets.map((tweet, idx) => (
                                    <li key={idx}>{tweet}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Dashboard;
