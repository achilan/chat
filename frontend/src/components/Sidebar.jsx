import { useChatStore } from "../store/useChatStore";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadMessages } = useChatStore();
  const [usersOriginal, setUsersOriginal] = useState([]);
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUsersTerm, setFilteredUsersTerm] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const filteredUsers = showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users;
    setFilteredUsers(filteredUsers);
  }, [showOnlineOnly, users, onlineUsers]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsersTerm(users);
      return;
    }
    const filteredUsers = users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsersTerm(filteredUsers);
  }, [searchTerm, users]);

  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]); // Selecciona el primer usuario de la lista
      useChatStore.getState().getMessages(users[0]._id); // Carga los mensajes del primer usuario
    }
  }, [users, selectedUser, setSelectedUser]);

  useEffect(() => {
    setUsersOriginal(users);
  }, [users]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsSearchOpen(false); // Cierra el modal de búsqueda
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5 relative">
        <div className="flex items-center gap-2">
          <button className="btn btn-sm gap-2" onClick={() => setIsSearchOpen(true)}>
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 p-5 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Buscar Contactos</h2>
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pr-10"
                list="user-suggestions"
              />
            {/*   <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-sm"
                onClick={() => setSearchTerm("")}
              >
                <X />
              </button> */}
            </div>
            <div className="mt-4 max-h-60 overflow-y-auto">
              {filteredUsersTerm.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="w-full p-2 hover:bg-base-300 rounded-lg text-left"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-8 object-cover rounded-full"
                    />
                    <div>
                      <div className="font-medium truncate">{user.fullName}</div>
                      <div className="text-sm text-zinc-400">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredUsersTerm.length === 0 && (
                <div className="text-center text-zinc-500 py-4">Ningún contacto encontrado</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {unreadMessages[user._id] > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2">
                  {unreadMessages[user._id]}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">Ningún contacto encontrado</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;