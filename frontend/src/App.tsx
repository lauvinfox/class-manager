import { Route, Routes } from "react-router-dom";

export const Home = () => {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
