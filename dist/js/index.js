let width = 1000,
  height = 800;

let svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

let path = d3.geoPath();

let x = d3
  .scaleLinear()
  .domain([2.6, 75.1])
  .rangeRound([200, 860]);

let color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeRdBu[9]);

let g = svg
  .append("g")
  .attr("class", "key")
  .attr("id", "legend")
  .attr("transform", "translate(0,0)");

g.selectAll("rect")
  .data(
    color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    })
  )
  .enter()
  .append("rect")
  .attr("height", 8)
  .attr("x", function(d) {
    return x(d[0]);
  })
  .attr("width", function(d) {
    return x(d[1]) - x(d[0]);
  })
  .attr("fill", function(d) {
    return color(d[0]);
  });

g.append("text")
  .attr("class", "caption")
  .attr("x", x.range()[0])
  .attr("y", -6)
  .attr("fill", "#696969");

g.call(
  d3
    .axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x) {
      return Math.round(x) + "%";
    })
    .tickValues(color.domain())
)
  .select(".domain")
  .remove();

const EDUCATION =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const MAP =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

d3.queue()
  .defer(d3.json, MAP)
  .defer(d3.json, EDUCATION)
  .await(ready);

function ready(error, us, education) {
  if (error) throw error;

  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", function(d) {
      return d.id;
    })
    .attr("data-education", function(d) {
      let result = education.filter(function(obj) {
        return obj.fips == d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      return 0;
    })
    .attr("fill", function(d) {
      let result = education.filter(function(obj) {
        return obj.fips == d.id;
      });
      if (result[0]) {
        return color(result[0].bachelorsOrHigher);
      }
      return color(0);
    })
    .attr("d", path)
    .on("mouseover", d => {
      tooltip.style("opacity", 0.9);
      tooltip.attr("data-year", d.Year);
      tooltip
        .html(() => {
          let county = education.filter(item => item.fips === d.id);
          if (county[0]) {
            return (
              county[0]["area_name"] +
              ", " +
              county[0]["state"] +
              ": " +
              county[0].bachelorsOrHigher +
              "%"
            );
          }
          return 0;
        })
        .attr("data-education", () => {
          let result = education.filter(item => item.fips === d.id);
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          return 0;
        })
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", d => {
      tooltip.style("opacity", 0);
    });

  svg
    .append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("class", "states")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#696969");
}
