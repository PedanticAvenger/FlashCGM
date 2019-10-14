//Nice suggestion from @Sergius on catching undefined elements and throwing an error you can work with.
export const getElementById = (id: string, root: ElementSearch = document) => {
    const element = root.getElementById(id);
    if (!element) {
        throw Error(`Element #${id} not found`);
    }
  
    return element;
  }

  
export function mmol( bg ) {
    let mmolBG = myNamespace.round( (bg / 18.0182), 2 ).toFixed(1);
    //let mmolBG2 = parseFloat((Math.round(mmolBG * 100))/100).toFixed(1);
    return mmolBG;
  }