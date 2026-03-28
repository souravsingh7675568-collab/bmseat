const EXTERNAL_API_URL = 'https://api.cricapi.com/v1/matches';
const API_KEY = '1c782863-9b6a-4580-a811-6daa117c7ee4'; // Replace with a real API key

// Local pricing logic based on venue/team
export const getPriceForVenue = (venue) => {
  if (venue?.includes('Chidambaram')) return 1500;
  if (venue?.includes('Chinnaswamy')) return 2000;
  if (venue?.includes('Modi')) return 1200;
  if (venue?.includes('Gandhi')) return 800;
  return 1000; // Default price
};

const getFallbackMatches = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: "ipl-101",
      team1: "Chennai Super Kings",
      team2: "Mumbai Indians",
      team1Short: "CSK",
      team2Short: "MI",
      date: "2026-04-10T19:30:00Z",
      venue: "M. A. Chidambaram Stadium, Chennai",
      description: "The classic rivalry! Witness MS Dhoni's CSK take on Rohit Sharma's MI.",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "ipl-102",
      team1: "Royal Challengers Bangalore",
      team2: "Kolkata Knight Riders",
      team1Short: "RCB",
      team2Short: "KKR",
      date: "2026-04-12T19:30:00Z",
      venue: "M. Chinnaswamy Stadium, Bangalore",
      description: "Virat Kohli back at Chinnaswamy against the fiery KKR lineup.",
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "ipl-103",
      team1: "Gujarat Titans",
      team2: "Rajasthan Royals",
      team1Short: "GT",
      team2Short: "RR",
      date: "2026-04-15T15:30:00Z",
      venue: "Narendra Modi Stadium, Ahmedabad",
      description: "A repeat of the epic final! GT takes on RR at the largest cricket stadium in the world.",
      image: "https://images.unsplash.com/photo-1595015024765-a8f895ce492b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "ipl-104",
      team1: "Sunrisers Hyderabad",
      team2: "Delhi Capitals",
      team1Short: "SRH",
      team2Short: "DC",
      date: "2026-04-18T19:30:00Z",
      venue: "Rajiv Gandhi International Stadium, Hyderabad",
      description: "Orange Army ready to rumble against the Capitals. Get your tickets now before they sell out.",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
};

export const fetchIplMatches = async () => {
  try {
    // Attempting to fetch match details from an external public API
    // (This requires an API key in a real scenario, this is an example URL)
    const url = new URL(EXTERNAL_API_URL);
    url.searchParams.append('apikey', API_KEY);
    url.searchParams.append('offset', 0);

    // Note: The external API fetch is active. If the key is invalid or request fails, 
    // it will throw and fall back to local data gracefully.
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('External API request failed or unauthorized');

    const apiData = await response.json();
    if (apiData.status !== "success") throw new Error('API returned an error wrapper');

    // Combine external match details with local proprietary pricing data
    const formattedMatches = apiData.data.map(match => ({
      id: match.id,
      team1: match.t1,
      team2: match.t2,
      team1Short: match.t1s,
      team2Short: match.t2s,
      date: match.dateTimeGMT,
      venue: match.venue || 'TBA',
      description: match.name,
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",

      // Here we merge the exact requirement: Pricing remains local/proprietary
      ticketPrice: getPriceForVenue(match.venue)
    }));

    return formattedMatches;

  } catch (error) {
    console.warn("External API fetch failed (likely missing API key). Falling back to mock matching prices...", error);

    // Merge price with the fallback matches too
    const fallbackBase = await getFallbackMatches();
    return fallbackBase.map(match => ({
      ...match,
      ticketPrice: getPriceForVenue(match.venue)
    }));
  }
};

export const fetchMatchDetails = async (id) => {
  const matches = await fetchIplMatches();
  return matches.find(m => m.id === id) || null;
};
