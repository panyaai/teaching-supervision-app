export interface User {
  User_ID: string;
  Name: string;
  Position: string;
  Subject_Group: string;
  Email: string;
  Role: string;
}

export interface SupervisionRecord {
  Supervision_ID: string;
  Date_Time: string;
  Teacher_Name: string;
  Supervisor_Name: string;
  Subject_Name: string;
  Subject_Code: string;
  Grade_Level: string;
  Status: string;
  Total_Score: number;
  Rating_Level: string;
  Strengths: string;
  Suggestions: string;
  Plan_URL: string;
}

export interface Category {
  Category_ID: string;
  Title: string;
}

export interface GASResponse {
  status: string;
  data: {
    users: User[];
    supervisionRecords: SupervisionRecord[];
    categories: Category[];
  };
}

export async function fetchGASData(): Promise<GASResponse> {
  const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;
  if (!GAS_URL) {
    throw new Error("NEXT_PUBLIC_GAS_URL is not defined in .env.local");
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from GAS:", error);
    throw error;
  }
}
