import autocomplete from "autocompleter";

class autocompleterService {
  static do = (elementId) => {
    // TODO vyvést toto do nějakého souboru constant toto pole je ještě v RecordPage
    var fishes = [{ label: "Kapr" }, { label: "Okoun" }, { label: "Candát" }];

    var input = document.getElementById(elementId);

    autocomplete({
      input: input,
      fetch: function (text, update) {
        text = text.toLowerCase();
        // you can also use AJAX requests instead of preloaded data
        var suggestions = fishes.filter((n) =>
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
