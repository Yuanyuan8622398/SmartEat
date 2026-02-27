document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("deficiencies")) {
    const fakeDeficiencies = ["Protein", "Vitamin D", "Iron"];
    localStorage.setItem("deficiencies", JSON.stringify(fakeDeficiencies));
  }
  initRecommendations();
  initMealPlanControls();
});

function initRecommendations() {
  const deficiencyTagsContainer = document.getElementById("deficiencyTags");
  const recommendationsContainer = document.getElementById("recommendationsContainer");
  const template = document.getElementById("recommendationCardTemplate");

  const userDeficiencies = JSON.parse(localStorage.getItem("deficiencies") || '[]');

  const recommendedFoods = [
    { name: "Salmon", targetNutrient: "Protein", description: "Rich in protein and healthy omega-3 fats.", benefits: ["Muscle growth", "Heart health", "Brain support"] },
    { name: "Spinach", targetNutrient: "Iron", description: "Packed with iron and vitamins for energy.", benefits: ["Boosts hemoglobin", "Supports immunity", "Rich in antioxidants"] },
    { name: "Almonds", targetNutrient: "Vitamin D", description: "Great source of Vitamin D and healthy fats.", benefits: ["Bone health", "Skin health", "Supports metabolism"] },
    { name: "Broccoli", targetNutrient: "Vitamin C", description: "High in vitamin C and fiber.", benefits: ["Immune support", "Digestive health"] },
    { name: "Oats", targetNutrient: "Fiber", description: "Excellent source of dietary fiber.", benefits: ["Digestive health", "Blood sugar control"] },
    { name: "Milk", targetNutrient: "Calcium", description: "Rich in calcium for strong bones and teeth.", benefits: ["Bone strength", "Teeth health", "Muscle function"] }
  ];

  deficiencyTagsContainer.innerHTML = "";
  if (userDeficiencies.length === 0) {
    deficiencyTagsContainer.textContent = "No deficiencies detected 🎉";
  } else {
    userDeficiencies.forEach(nutrient => {
      const span = document.createElement("span");
      span.className = "deficiency-tag";
      span.textContent = nutrient;
      deficiencyTagsContainer.appendChild(span);
    });
  }

  const filteredFoods = userDeficiencies.length > 0 ? recommendedFoods.filter(food => userDeficiencies.includes(food.targetNutrient)) : recommendedFoods;

  const mealPlanSection = document.querySelector(".meal-plan-section");
  const mealPlan = JSON.parse(localStorage.getItem("mealPlan") || "[]");

  filteredFoods.forEach(food => {
    const card = template.content.cloneNode(true);
    card.querySelector(".food-name").textContent = food.name;
    card.querySelector(".food-nutrient").textContent = food.targetNutrient;
    card.querySelector(".food-description").textContent = food.description;

    const benefitsContainer = card.querySelector(".food-benefits");
    benefitsContainer.innerHTML = "";
    if (food.benefits) {
      food.benefits.forEach(b => {
        const span = document.createElement("span");
        span.className = "benefit-tag";
        span.textContent = b;
        benefitsContainer.appendChild(span);
      });
    }

    const addBtn = card.querySelector(".add-btn");
    if (mealPlan.some(f => f.name === food.name)) {
      addBtn.textContent = "➖ Remove from Meal Plan";
      addBtn.style.background = "#c44a3d";
    }

    addBtn.addEventListener("click", () => {
      const mealPlan = JSON.parse(localStorage.getItem("mealPlan") || "[]");
      const index = mealPlan.findIndex(f => f.name === food.name);

      if (index === -1) {
        mealPlan.push({
          name: food.name,
          nutrient: food.targetNutrient,
          description: food.description,
          addedAt: new Date().toISOString()
        });
        addBtn.textContent = "➖ Remove from Meal Plan";
        addBtn.style.background = "#c44a3d";
      } else {
        mealPlan.splice(index, 1);
        addBtn.textContent = "➕ Add to Meal Plan";
        addBtn.style.background = "#2B5F3A";
      }

      localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
      renderMealPlan(mealPlan);
    });

    recommendationsContainer.insertBefore(card, mealPlanSection);
  });

  renderMealPlan(mealPlan);
}

function initMealPlanControls() {
  const viewBtn = document.getElementById("viewMealPlanBtn");
  const mealPlanList = document.getElementById("mealPlanList");

  if (!document.getElementById("clearMealPlanBtn")) {
    const clearBtn = document.createElement("button");
    clearBtn.id = "clearMealPlanBtn";
    clearBtn.textContent = "Clear Meal Plan";
    clearBtn.className = "view-btn";
    clearBtn.style.background = "#c44a3d";
    clearBtn.style.marginBottom = "15px";
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire meal plan?")) {
        localStorage.setItem("mealPlan", "[]");
        renderMealPlan([]);

        document.querySelectorAll(".add-btn").forEach(btn => {
          btn.textContent = "➕ Add to Meal Plan";
          btn.style.background = "#2B5F3A";
        });
      }
    });
    mealPlanList.parentElement.insertBefore(clearBtn, mealPlanList);
  }

  viewBtn.addEventListener("click", () => {
    const mealPlan = JSON.parse(localStorage.getItem("mealPlan") || "[]");
    renderMealPlan(mealPlan);
    mealPlanList.style.display = mealPlanList.style.display === "none" ? "block" : "none";
  });
}

function renderMealPlan(mealPlan) {
  const mealPlanList = document.getElementById("mealPlanList");
  mealPlanList.innerHTML = "";

  if (mealPlan.length === 0) {
    mealPlanList.innerHTML = "<p>Your meal plan is empty.</p>";
    return;
  }

  mealPlan.forEach((f, index) => {
    const div = document.createElement("div");
    div.className = "meal-plan-item";
    div.innerHTML = `
      <span>${f.name} (${f.nutrient})</span>
      <button class="remove-meal-btn" data-index="${index}">❌</button>
    `;
    mealPlanList.appendChild(div);
  });

  document.querySelectorAll(".remove-meal-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      const mealPlan = JSON.parse(localStorage.getItem("mealPlan") || "[]");
      const removed = mealPlan.splice(idx, 1)[0];
      localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
      renderMealPlan(mealPlan);

      document.querySelectorAll(".recommendation-card").forEach(card => {
        const name = card.querySelector(".food-name").textContent;
        const addBtn = card.querySelector(".add-btn");
        if (name === removed.name) {
          addBtn.textContent = "➕ Add to Meal Plan";
          addBtn.style.background = "#2B5F3A";
        }
      });
    });
  });
}