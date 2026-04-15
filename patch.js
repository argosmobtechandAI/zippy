const fs = require('fs');
const file = "zippiAdmin/src/pages/slotManagement.jsx";
let content = fs.readFileSync(file, 'utf8');

// replace updateSessionApi import
content = content.replace("createSessionApi, getAllUsersApi", "createSessionApi, updateSessionApi, getAllUsersApi");

// show date
content = content.replace(
  `{session.timing || "Invalid Time"}\n                                    </h3>`,
  `{session.timing || "Invalid Time"}\n                                    </h3>\n                                    <p className="text-[12px] font-bold text-[#964C2E] mb-1">{session.date}</p>`
);

// update UI state and button handlers
content = content.replace(
  `const [showModal, setShowModal] = useState(false);`,
  `const [showModal, setShowModal] = useState(false);\n    const [sessionToEdit, setSessionToEdit] = useState(null);`
);

content = content.replace(
  `onClick={() => setShowModal(true)}`,
  `onClick={() => { setSessionToEdit(null); setShowModal(true); }}`
);

// Block handler
content = content.replace(
  `{/* KPI Row */}`,
  `const handleBlock = async (sessionId) => {
        const res = await apiFunction(updateSessionApi, [sessionId], { status: "BLOCKED" }, "PUT", true);
        if(res?.success) { toast.success("Session Blocked"); fetchData(); } else { toast.error("Failed to block"); }
    };
    {/* KPI Row */}`
);

// button handlers for map
content = content.replace(
  `<button onClick={() => toast("Block feature coming soon")} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                            <Ban className="w-3.5 h-3.5 text-gray-500" /> Block
                                        </button>
                                        <button onClick={() => toast("Edit Session feature coming soon")} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                            <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                        </button>`,
  `<button onClick={() => handleBlock(session.id)} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                            <Ban className="w-3.5 h-3.5 text-gray-500" /> Block
                                        </button>
                                        <button onClick={() => { setSessionToEdit(session); setShowModal(true); }} className="flex-1 bg-white border border-[#E3CDBC] py-2.5 rounded-xl text-[12px] font-bold text-[#1e2330] flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                                            <Edit className="w-3.5 h-3.5 text-gray-500" /> Edit
                                        </button>`
);

content = content.replace(
  `<CreateSessionModal trainers={trainers} location={stableName} setShowModal={setShowModal} onSuccess={fetchData} />`,
  `<SessionModal sessionToEdit={sessionToEdit} trainers={trainers} location={stableName} setShowModal={setShowModal} onSuccess={fetchData} />`
);

// Update CreateSessionModal to SessionModal and add edit logic
content = content.replace(
  `const CreateSessionModal = ({ trainers, location, setShowModal, onSuccess }) => {`,
  `const SessionModal = ({ sessionToEdit, trainers, location, setShowModal, onSuccess }) => {`
);

content = content.replace(
  `title: "",
        startTime: "09:00",
        endTime: "10:30",
        date: new Date().toISOString().split('T')[0],
        joiningAmount: 100,
        trainerId: "",
        horseId: "", 
        duration: "90 Min",
        location: location,
        totalSeats: 10,`,
  `title: sessionToEdit?.title || "",
        startTime: sessionToEdit?.timing?.split("-")[0].trim() || "09:00",
        endTime: sessionToEdit?.timing?.split("-")[1].trim() || "10:30",
        date: sessionToEdit?.date || new Date().toISOString().split('T')[0],
        joiningAmount: sessionToEdit?.joiningAmount || 100,
        trainerId: sessionToEdit?.trainerId || "",
        horseId: sessionToEdit?.horseId || "", 
        duration: sessionToEdit?.duration || "90 Min",
        location: sessionToEdit?.location || location,
        totalSeats: sessionToEdit?.totalSeats || 10,`
);

content = content.replace(
  `const res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            if (res && res.success) {
                toast.success("Session created successfully");`,
  `let res;
            if (sessionToEdit) {
                res = await apiFunction(updateSessionApi, [sessionToEdit.id], finalData, "PUT", true);
            } else {
                res = await apiFunction(createSessionApi, [], finalData, "POST", true);
            }
            if (res && res.success) {
                toast.success(sessionToEdit ? "Session updated" : "Session created successfully");`
);

content = content.replace(
  `Add New Session`,
  `{sessionToEdit ? "Edit Session" : "Add New Session"}`
);

content = content.replace(
  `{isSubmitting ? "Creating..." : "Schedule Session"}`,
  `{isSubmitting ? "Saving..." : (sessionToEdit ? "Save Changes" : "Schedule Session")}`
);

fs.writeFileSync(file, content);
console.log("Patched!");
