import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header 
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-3"
      role="banner"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Bem-vindo ao Painel Administrativo
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Menu as="div" className="relative">
            <Menu.Button 
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-1"
              aria-label="Menu do usuário"
            >
              <UserCircleIcon className="w-8 h-8" aria-hidden="true" />
              <span className="text-sm font-medium">{user?.email}</span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
                        role="menuitem"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" aria-hidden="true" />
                        Sair
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}

export default Header;
