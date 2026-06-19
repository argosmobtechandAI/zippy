const levelsData = [
  { name: "Level 1", category: "Level", sessions: 10, weekdaysPrice: 18500, weekendPrice: 22500, monthlyPrice: null, description: "Learn the fundamentals of riding and confidently master the walk gait." },
  { name: "Level 2", category: "Level", sessions: 20, weekdaysPrice: 40000, weekendPrice: 45000, monthlyPrice: null, description: "Develop balance, control, and rhythm while learning the trot gait." },
  { name: "Level 3", category: "Level", sessions: 20, weekdaysPrice: 45000, weekendPrice: 50000, monthlyPrice: null, description: "Advance your riding skills and achieve confidence in the canter gait." },
  { name: "Non-Competitive Riding 1", category: "Riding Program", sessions: 8, monthlyPrice: 20000, weekdaysPrice: null, weekendPrice: null, description: "Structured monthly riding to maintain and fine-tune your core riding skills." },
  { name: "Non-Competitive Riding 2", category: "Riding Program", sessions: 12, monthlyPrice: 28000, weekdaysPrice: null, weekendPrice: null, description: "Enhanced riding frequency for riders seeking faster progression and refinement of basic riding skills." },
  { name: "Competitive Riding 1", category: "Riding Program", sessions: 8, monthlyPrice: 25000, weekdaysPrice: null, weekendPrice: null, description: "Technical riding training designed to prepare riders for their first competitions." },
  { name: "Competitive Riding 2", category: "Riding Program", sessions: 12, monthlyPrice: 35400, weekdaysPrice: null, weekendPrice: null, description: "Advanced competition-focused training for riders actively pursuing performance and competitive success." },
  { name: "Full Lease", category: "Lease Program", sessions: null, monthlyPrice: 105000, weekdaysPrice: null, weekendPrice: null, description: "An exclusive partnership with your dedicated equine partner for accelerated rider development." },
  { name: "Partial Lease", category: "Lease Program", sessions: null, monthlyPrice: 60000, weekdaysPrice: null, weekendPrice: null, description: "Enjoy dedicated riding opportunities with shared horse access and responsibility." },
  { name: "Private Horse Program", category: "Lease Program", sessions: null, monthlyPrice: 105000, weekdaysPrice: null, weekendPrice: null, description: "Premium facility access, training support, and horse management for riders with their own horse." }
];

async function seedLevels() {
  // First fetch all levels
  const getRes = await fetch("http://localhost:3000/api/levels");
  const getJson = await getRes.json();
  const existingLevels = getJson.levels || [];

  for (const level of levelsData) {
    try {
      const existing = existingLevels.find(l => l.name === level.name);
      
      const method = existing ? "PUT" : "POST";
      const url = existing ? `http://localhost:3000/api/levels/${existing.id}` : "http://localhost:3000/api/levels";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(level)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`Successfully ${existing ? 'updated' : 'added'}: ${level.name}`);
      } else {
        console.error(`Failed to ${existing ? 'update' : 'add'}: ${level.name} - ${data.message}`);
      }
    } catch (error) {
      console.error(`Error processing ${level.name}:`, error);
    }
  }
}

seedLevels();
