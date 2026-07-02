// App.tsx
import "./App.css";
import AppRouter from "./routes/AppRouter";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";

function App() {
  const loadSessionFromStorage = useAuthStore((state) => state.loadSessionFromStorage);

  useEffect(() => {
    loadSessionFromStorage();

    // ✅ Tab close par logout — reliable approach
    // sessionStorage automatically clears on tab close
    // Hum beforeunload pe check karte hain ki sessionStorage hai ya nahi
    const handleBeforeUnload = () => {
      // sessionStorage tab close pe automatically clear hoti hai
      // Isliye hum yahan kuch nahi karte — session restore logic
      // khud handle karega
      // 
      // Lekin agar user ne explicitly close kiya (not refresh),
      // sessionStorage already clear ho jaayegi browser ke through
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loadSessionFromStorage]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRouter />
    </>
  );
}

export default App;