import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.textContent = `${projects.length} Projects`;
}

let selectedIndex = -1; 
let query = '';

// Function to filter projects based on current search query and selected year
function filterProjects() {
  let filteredProjects = projects;
  
  // Apply search query filter if it exists
  if (query) {
    filteredProjects = filteredProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });
  }
  
  // Apply year filter if a slice is selected
  if (selectedIndex !== -1) {
    const yearData = d3.rollups(
      projects,
      (v) => v.length,
      (d) => d.year,
    );
    
    const years = yearData.map(([year]) => year);
    const selectedYear = years[selectedIndex];
    
    filteredProjects = filteredProjects.filter(project => project.year === selectedYear);
  }
  
  // Update the UI with filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  if (projectsTitle) {
    projectsTitle.textContent = `${filteredProjects.length} Projects`;
  }
  
  // Update pie chart based on search query only (not by year selection)
  const searchFilteredProjects = query ? projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  }) : projects;
  
  renderPieChart(searchFilteredProjects);
}

function renderPieChart(projectsGiven) {
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  
  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  // If no projects to display, clear chart and return
  if (projectsGiven.length === 0) {
    return;
  }

  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(45);
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  let colors = d3.scaleOrdinal()
    .range([
      "#B3D7FF", // Light blue
      "#5A9AE6", // Medium blue
      "#3D7CC9", // Medium dark blue
      "#1E5DA0"  // Dark blue
    ]);

  newArcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', (i === selectedIndex) ? 'selected' : '')
      .on('click', () => {
        // Toggle selection
        selectedIndex = selectedIndex === i ? -1 : i;
        
        // Update visual selection state
        svg 
          .selectAll('path')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
          ));
        
        legend 
          .selectAll('li')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
          ));

        // Filter projects with combined filters
        filterProjects();
    });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', (idx === selectedIndex) ? 'selected' : '')
      .attr('style', `--color:${colors(idx)}`) 
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Initial render
renderPieChart(projects);

// Set up search input handler
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  filterProjects();
});