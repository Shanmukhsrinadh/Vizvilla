// projects.js - Common functionality for all city pages
let currentCity = '';
let currentLocation = '';
let projectsData = {};
let currentProjectImages = [];
let currentImageIndex = 0;
let currentZoomLevel = 1;

// Initialize the page
function initPage(cityName) {
    currentCity = cityName;
    loadProjectsData();
}

// Load projects data from JSON
async function loadProjectsData() {
    try {
        const response = await fetch('projects.json');
        projectsData = await response.json();
        renderLocations();
    } catch (error) {
        console.error('Error loading projects data:', error);
    }
}

// Render locations for current city
function renderLocations() {
    const cityData = projectsData[currentCity];
    if (!cityData) {
        console.error(`No data found for city: ${currentCity}`);
        return;
    }

    const locationsGrid = document.querySelector('.location-cards-grid');
    if (!locationsGrid) return;

    locationsGrid.innerHTML = '';

    Object.keys(cityData.locations).forEach(locationName => {
        const location = cityData.locations[locationName];
        const locationCard = document.createElement('div');
        locationCard.className = 'location-card';
        locationCard.onclick = () => showLocation(locationName);
        
        locationCard.innerHTML = `
            <div class="property-card">
                <div class="property-image" style="background-image: url('${location.thumbnail}');"></div>
                <div class="property-info">
                    <span>${locationName}</span>
                </div>
            </div>
        `;
        
        locationsGrid.appendChild(locationCard);
    });

    // Create location details containers
    createLocationDetailsContainers();
}

// Create location details containers
function createLocationDetailsContainers() {
    const section = document.querySelector('.section');
    const existingContainers = document.querySelectorAll('.location-details');
    existingContainers.forEach(container => container.remove());

    Object.keys(projectsData[currentCity].locations).forEach(locationName => {
        const location = projectsData[currentCity].locations[locationName];
        const locationDetails = document.createElement('div');
        locationDetails.id = `${locationName}-details`;
        locationDetails.className = 'location-details';
        
        locationDetails.innerHTML = `
            <div class="location-header">
                <h2 class="location-title">${locationName}</h2>
                <button class="close-btn" onclick="hideLocation('${locationName}')">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>

            <div class="map-keypoints-container">
                <div class="map-container">
                    <iframe 
                        title="${locationName} Location" 
                        src="${location.map}"
                        scrolling="no" 
                        frameborder="0" 
                        style="width: 100%; height: 100%; border: none;"
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>

                <div class="keypoints-container">
                    <h3 class="keypoints-title">Key Highlights</h3>
                    <ul class="keypoints-list">
                        ${location.keypoints.map(point => `<li><strong>${point.title}:</strong> ${point.description}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="projects-section">
                <h3 class="projects-title">Our Projects in ${locationName}</h3>
                <div class="projects-grid" id="${locationName}-projects-container">
                    <!-- Projects will be loaded dynamically here -->
                </div>
            </div>

            <div class="content-section">
                <div class="content-grid">
                    <div>
                        <h3 class="content-title">About ${locationName}</h3>
                        <p>${location.about}</p>
                    </div>
                    <div>
                        <h3 class="content-title">Development Plans</h3>
                        <p>${location.developmentPlans}</p>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <div class="content-grid">
                    <div>
                        <h3 class="content-title">Investment Potential</h3>
                        <p>${location.investmentPotential}</p>
                    </div>
                    <div>
                        <h3 class="content-title">Connectivity</h3>
                        <p>${location.connectivity}</p>
                    </div>
                </div>
            </div>
        `;
        
        section.appendChild(locationDetails);
    });
}

// Show location details
function showLocation(locationName) {
    currentLocation = locationName;
    
    // Hide all location details
    document.querySelectorAll('.location-details').forEach(detail => {
        detail.classList.remove('location-active');
    });
    
    // Show selected location
    const locationDetails = document.getElementById(`${locationName}-details`);
    if (locationDetails) {
        locationDetails.classList.add('location-active');
        renderProjects(locationName);
        locationDetails.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide location details
function hideLocation(locationName) {
    const locationDetails = document.getElementById(`${locationName}-details`);
    if (locationDetails) {
        locationDetails.classList.remove('location-active');
    }
    currentLocation = '';
}

// Render projects for a location
function renderProjects(locationName) {
    const projectsContainer = document.getElementById(`${locationName}-projects-container`);
    if (!projectsContainer) return;

    const projects = projectsData[currentCity].locations[locationName].projects;
    projectsContainer.innerHTML = '';

    Object.keys(projects).forEach(projectName => {
        const project = projects[projectName];
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.onclick = () => showProjectDetails(locationName, projectName);
        
        projectCard.innerHTML = `
            <img src="${project.images[0]}" alt="${projectName}" class="project-image">
            <div class="project-info">
                <div class="project-name">${projectName}</div>
                <div class="project-location">${locationName}</div>
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });
}

// Show project details modal
function showProjectDetails(locationName, projectName) {
    const project = projectsData[currentCity].locations[locationName].projects[projectName];
    if (!project) return;

    currentProjectImages = project.images;
    currentImageIndex = 0;

    // Update modal content
    document.getElementById('project-modal-title').textContent = projectName;
    document.getElementById('project-main-image').src = project.images[0];
    document.getElementById('project-modal-description').textContent = project.description;
    document.getElementById('project-modal-benefits').textContent = project.benefits;

    // Update features
    const featuresList = document.getElementById('project-modal-features');
    featuresList.innerHTML = project.features.map(feature => `<li>${feature}</li>`).join('');

    // Update connectivity
    const connectivityList = document.getElementById('project-connectivity');
    connectivityList.innerHTML = project.connectivity.map(item => `<li>${item}</li>`).join('');

    // Update investment
    const investmentList = document.getElementById('project-investment');
    investmentList.innerHTML = project.investment.map(item => `<li>${item}</li>`).join('');

    // Update map
    document.getElementById('project-map-iframe').src = project.map;

    // Update carousel
    updateCarousel();

    // Show modal
    document.getElementById('project-details-modal').style.display = 'block';
}

// Update carousel
function updateCarousel() {
    const carouselTrack = document.getElementById('project-carousel-track');
    carouselTrack.innerHTML = '';
    
    currentProjectImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="${image}" alt="Project Image ${index + 1}" onclick="setMainImage(${index})">`;
        carouselTrack.appendChild(slide);
    });
}

// Set main image from carousel
function setMainImage(index) {
    currentImageIndex = index;
    document.getElementById('project-main-image').src = currentProjectImages[index];
    resetZoom('project-main-image');
}

// Move carousel
function moveCarousel(direction) {
    const track = document.getElementById('project-carousel-track');
    const slideWidth = 250 + 20; // 250px + 20px margin
    const currentTransform = track.style.transform ? parseInt(track.style.transform.split('(')[1]) : 0;
    const newTransform = currentTransform - (direction * slideWidth);
    
    track.style.transform = `translateX(${newTransform}px)`;
}

// Close project details modal
function closeProjectDetails() {
    document.getElementById('project-details-modal').style.display = 'none';
    resetZoom('project-main-image');
}

// Image zoom functionality
function adjustZoom(imageId, direction) {
    const image = document.getElementById(imageId);
    if (direction === 'in') {
        currentZoomLevel += 0.1;
    } else if (direction === 'out' && currentZoomLevel > 0.1) {
        currentZoomLevel -= 0.1;
    }
    image.style.transform = `scale(${currentZoomLevel})`;
}

function resetZoom(imageId) {
    const image = document.getElementById(imageId);
    currentZoomLevel = 1;
    image.style.transform = 'scale(1)';
}

// Full image modal functionality
function openFullImage(imageId) {
    const image = document.getElementById(imageId);
    const fullImageView = document.getElementById('full-image-view');
    fullImageView.src = image.src;
    fullImageView.style.transform = 'scale(1)';
    document.getElementById('full-image-modal').style.display = 'flex';
}

function closeFullImage() {
    document.getElementById('full-image-modal').style.display = 'none';
}

function adjustModalZoom(direction) {
    const image = document.getElementById('full-image-view');
    let currentScale = parseFloat(image.style.transform.replace('scale(', '').replace(')', '')) || 1;
    
    if (direction === 'in') {
        currentScale += 0.1;
    } else if (direction === 'out' && currentScale > 0.1) {
        currentScale -= 0.1;
    }
    
    image.style.transform = `scale(${currentScale})`;
}

function resetModalZoom() {
    const image = document.getElementById('full-image-view');
    image.style.transform = 'scale(1)';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const fullImageModal = document.getElementById('full-image-modal');
    const projectModal = document.getElementById('project-details-modal');
    
    if (event.target === fullImageModal) {
        closeFullImage();
    }
    if (event.target === projectModal) {
        closeProjectDetails();
    }
}

// Video thumbnail functionality
function setupVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoSrc = this.getAttribute('data-video-src');
            openVideoModal(videoSrc);
        });
    });
}

// Open video modal
function openVideoModal(videoSrc) {
    const videoModal = document.getElementById('video-modal');
    const videoElement = document.getElementById('modal-video');
    
    videoElement.src = videoSrc;
    videoModal.style.display = 'flex';
    videoElement.play();
}

// Close video modal
function closeVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const videoElement = document.getElementById('modal-video');
    
    videoElement.pause();
    videoElement.src = '';
    videoModal.style.display = 'none';
}

// Download brochure function
function downloadBrochure(projectName, brochureUrl) {
    const button = event.target.closest('.brochure-btn');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner"></i> Downloading...';
    button.classList.add('loading');
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = brochureUrl;
    link.download = `${projectName.replace(/\s+/g, '_')}_Brochure.pdf`;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button after 2 seconds
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('loading');
        
        // Show success message
        const successMsg = document.getElementById('download-success');
        if (successMsg) {
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
    }, 2000);
}

// Open contact modal
function openContactModal() {
    document.getElementById('contact-modal').style.display = 'flex';
}

// Close contact modal
function closeContactModal() {
    document.getElementById('contact-modal').style.display = 'none';
}

// Update the showProjectDetails function to include action buttons
function showProjectDetails(locationName, projectName) {
    const project = projectsData[currentCity].locations[locationName].projects[projectName];
    if (!project) return;

    currentProjectImages = project.images;
    currentImageIndex = 0;

    // Update modal content
    document.getElementById('project-modal-title').textContent = projectName;
    document.getElementById('project-main-image').src = project.images[0];
    document.getElementById('project-modal-description').textContent = project.description;
    document.getElementById('project-modal-benefits').textContent = project.benefits;

    // Update features
    const featuresList = document.getElementById('project-modal-features');
    featuresList.innerHTML = project.features.map(feature => `<li>${feature}</li>`).join('');

    // Update connectivity
    const connectivityList = document.getElementById('project-connectivity');
    connectivityList.innerHTML = project.connectivity.map(item => `<li>${item}</li>`).join('');

    // Update investment
    const investmentList = document.getElementById('project-investment');
    investmentList.innerHTML = project.investment.map(item => `<li>${item}</li>`).join('');

    // Update map
    document.getElementById('project-map-iframe').src = project.map;

    // Update carousel
    updateCarousel();

    // Add action buttons
    const actionsContainer = document.querySelector('.project-actions') || createActionsContainer();
    updateActionsContainer(actionsContainer, projectName, project.brochureUrl);

    // Show modal
    document.getElementById('project-details-modal').style.display = 'block';
}

// Create actions container if it doesn't exist
function createActionsContainer() {
    const modalBody = document.querySelector('.project-details-body');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'project-actions';
    actionsDiv.innerHTML = `
        <button class="action-btn brochure-btn" onclick="downloadBrochure('${document.getElementById('project-modal-title').textContent}', '')">
            <i class="fas fa-download"></i> Download Brochure
        </button>
        <button class="action-btn contact-btn" onclick="openContactModal()">
            <i class="fas fa-phone"></i> Contact Us
        </button>
        <div id="download-success" class="download-success">
            <i class="fas fa-check-circle"></i> Brochure downloaded successfully!
        </div>
    `;
    modalBody.appendChild(actionsDiv);
    return actionsDiv;
}

// Update actions container with project-specific data
function updateActionsContainer(container, projectName, brochureUrl) {
    const brochureBtn = container.querySelector('.brochure-btn');
    brochureBtn.setAttribute('onclick', `downloadBrochure('${projectName}', '${brochureUrl}')`);
}

// Update the renderProjects function to use video thumbnails
function renderProjects(locationName) {
    const projectsContainer = document.getElementById(`${locationName}-projects-container`);
    if (!projectsContainer) return;

    const projects = projectsData[currentCity].locations[locationName].projects;
    projectsContainer.innerHTML = '';

    Object.keys(projects).forEach(projectName => {
        const project = projects[projectName];
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.onclick = () => showProjectDetails(locationName, projectName);
        
        // Use video thumbnail if available, otherwise use image
        const thumbnailContent = project.videoThumbnail ? 
            `<div class="video-thumbnail" data-video-src="${project.videoThumbnail}">
                <video muted loop>
                    <source src="${project.videoThumbnail}" type="video/mp4">
                </video>
                <div class="video-play-overlay">
                    <div class="video-play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            </div>` :
            `<img src="${project.images[0]}" alt="${projectName}" class="project-image">`;
        
        projectCard.innerHTML = `
            ${thumbnailContent}
            <div class="project-info">
                <div class="project-name">${projectName}</div>
                <div class="project-location">${locationName}</div>
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });

    // Setup video thumbnails after rendering
    setTimeout(setupVideoThumbnails, 100);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const fullImageModal = document.getElementById('full-image-modal');
    const projectModal = document.getElementById('project-details-modal');
    const contactModal = document.getElementById('contact-modal');
    const videoModal = document.getElementById('video-modal');
    
    if (event.target === fullImageModal) {
        closeFullImage();
    }
    if (event.target === projectModal) {
        closeProjectDetails();
    }
    if (event.target === contactModal) {
        closeContactModal();
    }
    if (event.target === videoModal) {
        closeVideoModal();
    }
}
// Datawrapper script
!function(){"use strict";window.addEventListener("message",(function(a){if(void 0!==a.data["datawrapper-height"]){var e=document.querySelectorAll("iframe");for(var t in a.data["datawrapper-height"])for(var r,i=0;r=e[i];i++)if(r.contentWindow===a.source){var d=a.data["datawrapper-height"][t]+"px";r.style.height=d}}}))}();