import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {

const hearings = [
{case:"State vs Kumar",date:"Tomorrow"},
{case:"Ravi vs Bank",date:"2 Days"},
{case:"Client vs Builder",date:"5 Days"}
];

return (

<div className="flex">

<Sidebar/>

<div className="flex-1">

<Navbar/>

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">
Legal Dashboard
</h1>

<div className="grid grid-cols-3 gap-6 mb-6">

<div className="bg-white shadow p-5 rounded">
<h2 className="text-gray-500">Active Cases</h2>
<p className="text-2xl font-bold">18</p>
</div>

<div className="bg-white shadow p-5 rounded">
<h2 className="text-gray-500">Upcoming Hearings</h2>
<p className="text-2xl font-bold">5</p>
</div>

<div className="bg-white shadow p-5 rounded">
<h2 className="text-gray-500">New Documents</h2>
<p className="text-2xl font-bold">12</p>
</div>

</div>

<div className="bg-white shadow p-5 rounded">

<h2 className="text-xl font-semibold mb-4">
Upcoming Hearings
</h2>

{hearings.map((h,i)=>(
<div key={i} className="border-b py-2">
{h.case} - {h.date}
</div>
))}

</div>

</div>

</div>

</div>

)

}

export default Dashboard