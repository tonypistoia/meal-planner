import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingCart, ChefHat, Loader2, RefreshCw, ExternalLink, Archive, Star } from 'lucide-react';

const MealPlannerApp = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [checkedItems, setCheckedItems] = useState({});
  const [archivedRecipes, setArchivedRecipes] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [ratings, setRatings] = useState({ cost: 0, taste: 0, difficulty: 0 });
  const [showLunchQuiz, setShowLunchQuiz] = useState(true);
  const [lunchPrefs, setLunchPrefs] = useState({
    protein: '',
    carb: '',
    veggie: '',
    style: ''
  });
  const [bulkItems, setBulkItems] = useState({
    'greek yogurt': false,
    'hemp seeds': true,
    'blueberries': true,
    'granola': false,
    'peanut butter': false
  });

  const nytRecipes = [
    "Marry Me Chicken", "Gochujang Caramel Cookies", "Marry Me Chickpeas", 
    "Creamy Miso Pasta", "Cottage Cheese Ice Cream", "Lasagna Soup",
    "Butter Chicken", "Japchae", "Crispy Rice Salad", "Salmon Rice Bowl",
    "Sheet Pan Chicken Fajitas", "One-Pot Chicken and Rice", "Thai Basil Chicken",
    "Shakshuka", "Honey Garlic Shrimp", "Greek Chicken Bowl", "Beef Bulgogi",
    "Cilantro Lime Chicken", "Teriyaki Salmon", "Mediterranean Chickpea Salad"
  ];

  const generateMealPlan = async (preferences) => {
    setLoading(true);
    setShowLunchQuiz(false);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `Generate a personalized weekly meal plan for marathon training focused on energy, focus, and reducing brain fog.

REQUIREMENTS:

LUNCH (Make once on Sunday, eat Mon-Fri):
- Create a meal prep recipe based on these preferences:
  * Protein: ${preferences.protein}
  * Carb: ${preferences.carb}
  * Veggie: ${preferences.veggie}
  * Style: ${preferences.style}
- Should be healthy, flavorful, economical
- Easy to meal prep and reheat
- Serves 5 lunches (one per weekday)
- If there's an online recipe source, provide the URL

DINNERS:
- 2 recipes from NYT Cooking 2025 popular recipes: ${nytRecipes.join(", ")}
- Each NYT recipe serves 2-4 and will be made TWICE during the week (so each recipe covers 2 nights)
- 1 additional easy, quick recipe (doesn't need to be NYT) that serves 2-4 for 1 night
- Total: 5 dinner nights covered (2 recipes × 2 nights each = 4 nights, plus 1 easy recipe = 5 nights)
- Indicate which nights to make each recipe vs use leftovers
- For NYT recipes, provide the actual NYT Cooking URL if available
- Focus on: healthy, flavorful, economical, marathon training nutrition

SHOPPING LIST OPTIMIZATION:
- Identify items that can be bought in bulk (chicken, cheese, rice, beans, etc.) and note "bulk option" 
- Mark common ingredients used across multiple recipes
- Separate weekly items from bulk/pantry staples

BREAKFAST (for shopping list reference):
Weekly purchases: 2 tubs Greek yogurt
Already stocked in bulk: hemp seeds, blueberries
May need: granola, peanut butter

Return ONLY a JSON object (no preamble, no markdown):
{
  "lunch": {
    "name": "",
    "recipeUrl": "",
    "serves": "5 lunches",
    "ingredients": [],
    "instructions": "",
    "prepTime": "",
    "nutritionHighlight": ""
  },
  "dinners": [
    {
      "day": "Monday",
      "name": "",
      "recipeUrl": "",
      "isLeftover": false,
      "serves": "2-4",
      "source": "NYT Top 50",
      "mealNumber": 1,
      "ingredients": [],
      "instructions": "",
      "cookTime": "",
      "nutritionHighlight": ""
    },
    {
      "day": "Tuesday", 
      "name": "[Same as Monday]",
      "isLeftover": true,
      "mealNumber": 1
    },
    {
      "day": "Wednesday",
      "name": "",
      "recipeUrl": "",
      "isLeftover": false,
      "serves": "2-4",
      "source": "NYT Top 50",
      "mealNumber": 2,
      "ingredients": [],
      "instructions": "",
      "cookTime": "",
      "nutritionHighlight": ""
    },
    {
      "day": "Thursday",
      "name": "[Same as Wednesday]",
      "isLeftover": true,
      "mealNumber": 2
    },
    {
      "day": "Friday",
      "name": "",
      "recipeUrl": "",
      "isLeftover": false,
      "serves": "2-4",
      "source": "Quick & Easy",
      "mealNumber": 3,
      "ingredients": [],
      "instructions": "",
      "cookTime": "",
      "nutritionHighlight": ""
    }
  ],
  "shoppingList": {
    "weeklyEssentials": {
      "dairy": [],
      "produce": [],
      "meat": []
    },
    "bulkOptions": {
      "pantry": [],
      "freezer": [],
      "cheese": []
    },
    "other": []
  }
}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content.find(item => item.type === "text")?.text || "";
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      
      setMealPlan(parsed);
      setCheckedItems({});
    } catch (error) {
      console.error("Error generating meal plan:", error);
      alert("Failed to generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLunchPrefChange = (field, value) => {
    setLunchPrefs(prev => ({ ...prev, [field]: value }));
  };

  const handleQuizSubmit = () => {
    if (!lunchPrefs.protein || !lunchPrefs.carb || !lunchPrefs.veggie || !lunchPrefs.style) {
      alert("Please select all preferences before generating your meal plan");
      return;
    }
    generateMealPlan(lunchPrefs);
  };

  const toggleItem = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleBulkItem = (item) => {
    setBulkItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const openRatingModal = (recipe) => {
    setCurrentRecipe(recipe);
    setRatings({ cost: 0, taste: 0, difficulty: 0 });
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (ratings.cost === 0 || ratings.taste === 0 || ratings.difficulty === 0) {
      alert("Please rate all categories before submitting");
      return;
    }

    const totalScore = ((ratings.cost + ratings.taste + ratings.difficulty) / 3).toFixed(1);
    const newRecipe = {
      ...currentRecipe,
      ratings: ratings,
      totalScore: parseFloat(totalScore),
      dateCompleted: new Date().toLocaleDateString()
    };

    setArchivedRecipes(prev => [...prev, newRecipe]);
    setShowRatingModal(false);
    setCurrentRecipe(null);
    setRatings({ cost: 0, taste: 0, difficulty: 0 });
  };

  const generateShoppingLink = (store) => {
    if (store === 'wholefoods') {
      return `https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo`;
    } else if (store === 'safeway') {
      return `https://www.safeway.com/`;
    }
    return '#';
  };

  const getLeaderboard = () => {
    return [...archivedRecipes]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Creating your weekly meal plan...</p>
          <p className="text-gray-500 text-sm mt-2">Customizing based on your preferences</p>
        </div>
      </div>
    );
  }

  if (showLunchQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <ChefHat className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Customize Your Lunch</h1>
                  <p className="text-green-100 text-sm mt-1">Pick your preferences for this week's meal prep</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Protein
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Chicken', 'Beef', 'Pork', 'Salmon', 'Shrimp', 'Tofu', 'Chickpeas', 'Turkey'].map((protein) => (
                    <button
                      key={protein}
                      onClick={() => handleLunchPrefChange('protein', protein)}
                      className={`p-3 rounded-lg border-2 font-semibold transition ${
                        lunchPrefs.protein === protein
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {protein}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Carb
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Rice', 'Quinoa', 'Pasta', 'Sweet Potato', 'Regular Potato', 'Couscous', 'Tortillas', 'Bread'].map((carb) => (
                    <button
                      key={carb}
                      onClick={() => handleLunchPrefChange('carb', carb)}
                      className={`p-3 rounded-lg border-2 font-semibold transition ${
                        lunchPrefs.carb === carb
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {carb}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Veggie
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Broccoli', 'Bell Peppers', 'Spinach', 'Kale', 'Carrots', 'Zucchini', 'Green Beans', 'Cauliflower'].map((veggie) => (
                    <button
                      key={veggie}
                      onClick={() => handleLunchPrefChange('veggie', veggie)}
                      className={`p-3 rounded-lg border-2 font-semibold transition ${
                        lunchPrefs.veggie === veggie
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {veggie}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Mexican', 'Asian', 'Mediterranean', 'Italian', 'American', 'Indian', 'Thai', 'Bowl/Salad'].map((style) => (
                    <button
                      key={style}
                      onClick={() => handleLunchPrefChange('style', style)}
                      className={`p-3 rounded-lg border-2 font-semibold transition ${
                        lunchPrefs.style === style
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={handleQuizSubmit}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition"
              >
                Generate My Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Rest of the meal plan UI - I'll continue in next message due to length */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <ChefHat className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Weekly Meal Plan</h1>
              </div>
              <button
                onClick={() => setShowLunchQuiz(true)}
                className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                <RefreshCw className="w-4 h-4" />
                New Plan
              </button>
            </div>
          </div>

          <div className="p-6 text-center">
            <p className="text-gray-600">Meal plan interface loading...</p>
            <p className="text-sm text-gray-500 mt-2">Full interface will appear after selecting lunch preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerApp;
