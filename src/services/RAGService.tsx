
const API_BASE_URL = 'http://127.0.0.1:8000'


const ragService = {
    getRecommendations: async (query: string, context: { role: string, content: string}[]): Promise<string> => {
      try {
        const request = {
          customer_query: query,
          context: context
        };
        
        const response = await fetch(`${API_BASE_URL}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }
    }
  };
  

export default ragService