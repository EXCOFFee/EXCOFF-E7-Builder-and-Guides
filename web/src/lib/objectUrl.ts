// URL de previsualización para un archivo elegido en un <input type="file">.
// Llamar a URL.createObjectURL() en el render creaba una URL nueva (que nunca se liberaba)
// en cada re-render, por ejemplo con cada tecla del formulario, y la imagen se recargaba.
// Acá hay una sola URL por archivo; vive lo que dura la página, acotada a los archivos elegidos.
const urls = new WeakMap<File, string>();

export function previewUrl(file: File): string {
    let url = urls.get(file);
    if (!url) {
        url = URL.createObjectURL(file);
        urls.set(file, url);
    }
    return url;
}
