import { Outlet } from "react-router-dom";
import Header from "../pages/public/components/Header";
export default function FarmerLayout() {
  return (
    <div>
      <Header/>
      <Outlet />
    </div>
  );
}