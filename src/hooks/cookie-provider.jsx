import  {  useState, createContext , useContext} from "react";


// Create a context for cookies
const CookieContext = createContext();

export const CookieProvider = ({ children }) => {
    const [cookies, setCookies] = useState(() => {
        const savedCookies = document.cookie
            .split("; ")
            .reduce((acc, curr) => {
                const [name, value] = curr.split("=");
                acc[name] = value;
                return acc;
            }, {});
        return savedCookies;
    });

    const updateCookie = (name, value) => {
        document.cookie = `${name}=${value}; path=/`;
        setCookies((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <CookieContext.Provider value={{ cookies, updateCookie }}>
            {children}
        </CookieContext.Provider>
    );
};

export const useCookies = () => {
    return useContext(CookieContext);
};

