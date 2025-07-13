import {AuthProvider} from "./contexts/AuthProvider.tsx";
import {Route, Routes} from "react-router-dom";
import TitleBar from "./components/TitleBar.tsx";
import Login from "./pages/Login.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Catalog from "./pages/Catalog.tsx";
import Learnmenu from "@/pages/Learnmenu.tsx";
import Stats from "@/pages/Stats.tsx";
import Settings from "@/pages/Settings.tsx";

function App() {

    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <TitleBar/>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route element={<RequireAuth/>}>
                        <Route path="/" element={<Learnmenu/>}/>
                        <Route path="/catalog" element={<Catalog/>}/>
                        <Route path="/stats" element={<Stats/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                    </Route>
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
