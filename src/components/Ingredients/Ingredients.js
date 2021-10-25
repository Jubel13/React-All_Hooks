import React, { useCallback, useMemo, useEffect, useReducer } from "react";
import IngredientList from "./IngredientList";
import IngredientForm from "./IngredientForm";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredient, action) => {
    switch (action.type) {
        case "SET":
            return action.ingredients;
        case "ADD":
            return [...currentIngredient, action.ingredient];
        case "DELETE":
            return currentIngredient.filter((ing) => ing.id !== action.id);
        default:
            throw new Error("Should not get here");
    }
};

function Ingredients() {
    const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
    const { loading, error, data, sendRequest, extra, identifier, clear } =
        useHttp();
    // const [ingredients, setIngredients] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState();

    useEffect(() => {
        if (!loading && !error && identifier === "REMOVE_INGREDIENT") {
            dispatch({ type: "DELETE", id: extra });
        } else if (!loading && !error && identifier === "ADD_INGREDIENT") {
            dispatch({
                type: "ADD",
                ingredient: { id: data.name, ...extra },
            });
        }
    }, [data, extra, identifier, loading, error]);

    const filteredIngredientsHandler = useCallback((loadedFilter) => {
        // setIngredients(loadedFilter);
        dispatch({ type: "SET", ingredients: loadedFilter });
    }, []);

    const addIngredientsHandler = useCallback(
        (ingredient) => {
            sendRequest(
                "https://react-http-8325a-default-rtdb.firebaseio.com/ingredients.json",
                "POST",
                JSON.stringify(ingredient),
                ingredient,
                "ADD_INGREDIENT"
            );
        },
        [sendRequest]
    );

    const removeItemHandler = useCallback(
        (id) => {
            sendRequest(
                `https://react-http-8325a-default-rtdb.firebaseio.com/ingredients/${id}.json`,
                "DELETE",
                null,
                id,
                "REMOVE_INGREDIENT"
            );
        },
        [sendRequest]
    );

    const ingredienList = useMemo(() => {
        return (
            <IngredientList
                ingredients={userIngredients}
                onRemoveItem={removeItemHandler}
            />
        );
    }, [userIngredients, removeItemHandler]);

    return (
        <div className='App'>
            {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
            <IngredientForm onAdd={addIngredientsHandler} loading={loading} />
            <section>
                <Search onLoadIngredients={filteredIngredientsHandler} />
                {ingredienList}
            </section>
        </div>
    );
}

export default Ingredients;
