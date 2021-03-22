import autocomplete from "autocompleter";
import { fishKind } from "../../constants";

class autocompleterService {
  static do = (elementId) => {
    let fishes = [];
    fishKind.forEach((f) => fishes.push({ label: f }));

    let input = document.getElementById(elementId);

    autocomplete({
      input: input,
      fetch: function (text, update) {
        text = text.toLowerCase();
        // you can also use AJAX requests instead of preloaded data
        let suggestions = fishes.filter((n) =>
          n.label.toLowerCase().startsWith(text)
        );
        update(suggestions);
      },
      minLength: 1,
      onSelect: function (item) {
        input.value = item.label;
      },
    });
  };
}

export default autocompleterService;
