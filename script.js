// API URL for the Railway backend
const API_URL = 'https://web-production-d0d1.up.railway.app';

document.addEventListener('DOMContentLoaded', function() {
    // Set up form submission event listener
    document.getElementById('validationForm').addEventListener('submit', handleFormSubmit);
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        idea: document.getElementById('idea').value,
        target_market: document.getElementById('target_market').value,
        industry: document.getElementById('industry').value,
        budget: document.getElementById('budget').value || "Not specified"
    };

    // Show loading
    document.querySelector('.loading').style.display = 'block';
    document.querySelector('.validation-form').style.display = 'none';
    document.querySelector('.results-container').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
        console.log('Sending request to:', `${API_URL}/validate`);
        console.log('Request data:', formData);

        // Make sure we're using the correct endpoint
        const response = await fetch(`${API_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            mode: 'cors',
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server error response:', errorData);
            throw new Error(`Failed to validate business idea: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Response data:', result);
        displayResults(result);

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.loading').style.display = 'none';
        document.querySelector('.validation-form').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = 'Error: ' + error.message;
    }
}

// Display results in the UI
function displayResults(data) {
    document.querySelector('.loading').style.display = 'none';
    const container = document.getElementById('resultsContainer');
    container.style.display = 'block';

    container.innerHTML = `
        <div class="overall-score">
            <h2>Overall Validation Score</h2>
            <div class="score-circle" style="--score: ${data.overall_score}">
                <span>${data.overall_score}/10</span>
            </div>
            <p>${getScoreMessage(data.overall_score)}</p>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-chart-line"></i> Market Analysis</h3>
            <div class="analysis-grid">
                ${Object.entries(data.market_analysis).map(([key, value]) => `
                    <div class="analysis-card">
                        <h4>${formatKey(key)}</h4>
                        <p>${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-trophy"></i> Competitive Analysis</h3>
            <div class="analysis-grid">
                ${Object.entries(data.competitive_analysis).map(([key, value]) => `
                    <div class="analysis-card">
                        <h4>${formatKey(key)}</h4>
                        <p>${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-cogs"></i> Feasibility Analysis</h3>
            <div class="analysis-grid">
                ${Object.entries(data.feasibility_analysis).map(([key, value]) => `
                    <div class="analysis-card">
                        <h4>${formatKey(key)}</h4>
                        <p>${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-money-bill-wave"></i> Financial Analysis</h3>
            <div class="analysis-grid">
                ${Object.entries(data.financial_analysis).map(([key, value]) => `
                    <div class="analysis-card">
                        <h4>${formatKey(key)}</h4>
                        <p>${value}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-balance-scale"></i> SWOT Analysis</h3>
            <div class="swot-grid">
                <div class="swot-item">
                    <h4><i class="fas fa-plus-circle" style="color: #4ade80;"></i> Strengths</h4>
                    <ul>
                        ${data.swot_analysis.strengths.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="swot-item">
                    <h4><i class="fas fa-minus-circle" style="color: #ef4444;"></i> Weaknesses</h4>
                    <ul>
                        ${data.swot_analysis.weaknesses.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="swot-item">
                    <h4><i class="fas fa-arrow-up-right-dots" style="color: #3b82f6;"></i> Opportunities</h4>
                    <ul>
                        ${data.swot_analysis.opportunities.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="swot-item">
                    <h4><i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Threats</h4>
                    <ul>
                        ${data.swot_analysis.threats.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-check-circle"></i> Recommendations</h3>
            <div class="recommendations">
                <ul>
                    ${data.recommendations.map(item => `
                        <li><i class="fas fa-check"></i> ${item}</li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <div class="analysis-section">
            <h3><i class="fas fa-exclamation-circle"></i> Potential Risks</h3>
            <div class="risks">
                <ul>
                    ${data.risks.map(item => `
                        <li><i class="fas fa-exclamation-triangle"></i> ${item}</li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <button class="new-validation-btn" onclick="startNewValidation()">
            <i class="fas fa-plus"></i> Validate Another Idea
        </button>
    `;
}

// Format keys for display
function formatKey(key) {
    return key.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Get message based on score
function getScoreMessage(score) {
    if (score >= 8) return "Excellent potential! This idea shows great promise.";
    if (score >= 6) return "Good potential with some areas to improve.";
    if (score >= 4) return "Moderate potential. Consider addressing key weaknesses.";
    return "Needs significant refinement. Review recommendations carefully.";
}

// Start a new validation
function startNewValidation() {
    document.querySelector('.validation-form').style.display = 'block';
    document.querySelector('.results-container').style.display = 'none';
    document.getElementById('validationForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
