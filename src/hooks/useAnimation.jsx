import useDebounce from "./useDebounce";
import useStopProp from "./useStopProp";

export default function useAnimation() {

  const debounce = useDebounce();
  const [stopUserInteraction, restoreUserInteraction] = useStopProp([
    "click",
    "keydown",
  ]);

  function addAnimation(animation, setState, condition = undefined, cb) {
    stopUserInteraction();

    setState((currentState) => {
      const newBoard = currentState.map((state) => {
        //will default to true if no condition passed
        if (condition?.includes(state) ?? true) return { ...state, animation };
        return state;
      });
      return newBoard;
    });

    cb?.();
    //restoreUserInteration is handled in onAnimationEnd listener on tile element
  }


  function animationEnd(setState, condition = false, cb, delay = 200) {
    debounce(() => {
      //set animation to null on any setState passed in:
      setState((currentState) => {
        return currentState.map?.((state) => {
          if (state.animation) return { ...state, animation: null };
          return state;
        });
      });

      cb?.();

      if (condition) return;
      restoreUserInteraction();
    }, delay);
  }

  return [addAnimation, animationEnd];
}