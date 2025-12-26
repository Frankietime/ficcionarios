"""
Aplicación GUI para generar diccionarios de Kindle
"""
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from pathlib import Path
import generator


class DictionaryGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Generador de Diccionarios Kindle")
        self.root.geometry("800x900")
        
        # Variables
        self.title_var = tk.StringVar()
        self.creator_var = tk.StringVar()
        self.in_language_var = tk.StringVar(value="es-es")
        self.out_language_var = tk.StringVar(value="es-es")
        self.version_var = tk.StringVar(value="1.0")
        self.output_name_var = tk.StringVar()
        self.cover_image_path = tk.StringVar()
        self.copyright_text = tk.StringVar()
        self.usage_text = tk.StringVar()
        self.custom_styles = tk.StringVar()
        
        self.create_widgets()
    
    def create_widgets(self):
        # Frame principal con scroll
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        row = 0
        
        # Título
        ttk.Label(main_frame, text="Título del diccionario:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.title_var, width=50).grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        row += 1
        
        # Creador
        ttk.Label(main_frame, text="Creador/Autor:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.creator_var, width=50).grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        row += 1
        
        # Idioma de entrada
        ttk.Label(main_frame, text="Idioma de entrada:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        in_lang_frame = ttk.Frame(main_frame)
        in_lang_frame.grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Entry(in_lang_frame, textvariable=self.in_language_var, width=20).pack(side=tk.LEFT)
        ttk.Label(in_lang_frame, text=" (ej: es-es, en-us, pt-br)").pack(side=tk.LEFT)
        row += 1
        
        # Idioma de salida
        ttk.Label(main_frame, text="Idioma de salida:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        out_lang_frame = ttk.Frame(main_frame)
        out_lang_frame.grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Entry(out_lang_frame, textvariable=self.out_language_var, width=20).pack(side=tk.LEFT)
        ttk.Label(out_lang_frame, text=" (ej: es-es, en-us, pt-br)").pack(side=tk.LEFT)
        row += 1
        
        # Versión
        ttk.Label(main_frame, text="Versión:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.version_var, width=20).grid(row=row, column=1, sticky=tk.W, pady=5)
        row += 1
        
        # Nombre del archivo de salida
        ttk.Label(main_frame, text="Nombre del archivo .opf:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.output_name_var, width=50).grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        row += 1
        
        # Separador
        ttk.Separator(main_frame, orient='horizontal').grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        row += 1
        
        # Imagen de cover
        ttk.Label(main_frame, text="Imagen de portada:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        cover_frame = ttk.Frame(main_frame)
        cover_frame.grid(row=row, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Entry(cover_frame, textvariable=self.cover_image_path, width=40, state='readonly').pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(cover_frame, text="Buscar...", command=self.browse_cover_image).pack(side=tk.LEFT, padx=5)
        row += 1
        
        # Copyright
        ttk.Label(main_frame, text="Texto de Copyright:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        row += 1
        copyright_text_widget = scrolledtext.ScrolledText(main_frame, height=4, width=50)
        copyright_text_widget.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        copyright_text_widget.insert('1.0', self.copyright_text.get())
        self.copyright_text_widget = copyright_text_widget
        row += 1
        
        # Uso
        ttk.Label(main_frame, text="Texto de Uso/Instrucciones:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        row += 1
        usage_text_widget = scrolledtext.ScrolledText(main_frame, height=4, width=50)
        usage_text_widget.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        usage_text_widget.insert('1.0', self.usage_text.get())
        self.usage_text_widget = usage_text_widget
        row += 1
        
        # Separador
        ttk.Separator(main_frame, orient='horizontal').grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        row += 1
        
        # Definiciones
        ttk.Label(main_frame, text="Definiciones:", font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        ttk.Label(main_frame, text="Formato: palabra definición (una por línea)", 
                 font=('Arial', 8), foreground='gray').grid(row=row, column=1, sticky=tk.W, pady=5)
        row += 1
        
        definitions_text = scrolledtext.ScrolledText(main_frame, height=10, width=50)
        definitions_text.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        main_frame.rowconfigure(row, weight=1)
        self.definitions_text = definitions_text
        row += 1
        
        # Estilos CSS personalizados
        ttk.Label(main_frame, text="Estilos CSS personalizados (opcional):", 
                 font=('Arial', 10, 'bold')).grid(row=row, column=0, sticky=tk.W, pady=5)
        row += 1
        styles_text = scrolledtext.ScrolledText(main_frame, height=4, width=50)
        styles_text.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        styles_text.insert('1.0', self.custom_styles.get())
        styles_text.bind('<KeyRelease>', lambda e: self.update_text_var(styles_text, self.custom_styles))
        self.styles_text = styles_text
        row += 1
        
        # Botones
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=row, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Generar Diccionario", 
                  command=self.generate_dictionary, width=20).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cargar desde archivo .txt", 
                  command=self.load_definitions_file, width=20).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Salir", 
                  command=self.root.quit, width=20).pack(side=tk.LEFT, padx=5)
    
    def update_text_var(self, text_widget, var):
        """Actualiza una variable StringVar con el contenido del widget de texto"""
        if var:
            content = text_widget.get('1.0', tk.END).rstrip('\n')
            var.set(content)
    
    def browse_cover_image(self):
        """Abre diálogo para seleccionar imagen de portada"""
        filename = filedialog.askopenfilename(
            title="Seleccionar imagen de portada",
            filetypes=[("Imágenes", "*.jpg *.jpeg *.png"), ("Todos los archivos", "*.*")]
        )
        if filename:
            self.cover_image_path.set(filename)
    
    def load_definitions_file(self):
        """Carga definiciones desde un archivo de texto"""
        filename = filedialog.askopenfilename(
            title="Cargar definiciones",
            filetypes=[("Archivos de texto", "*.txt"), ("Todos los archivos", "*.*")]
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.definitions_text.delete('1.0', tk.END)
                self.definitions_text.insert('1.0', content)
                messagebox.showinfo("Éxito", f"Definiciones cargadas desde {Path(filename).name}")
            except Exception as e:
                messagebox.showerror("Error", f"No se pudo cargar el archivo:\n{str(e)}")
    
    def validate_inputs(self):
        """Valida que todos los campos requeridos estén completos"""
        if not self.title_var.get().strip():
            messagebox.showerror("Error", "Por favor ingrese el título del diccionario")
            return False
        
        if not self.creator_var.get().strip():
            messagebox.showerror("Error", "Por favor ingrese el nombre del creador")
            return False
        
        if not self.in_language_var.get().strip():
            messagebox.showerror("Error", "Por favor ingrese el idioma de entrada")
            return False
        
        if not self.out_language_var.get().strip():
            messagebox.showerror("Error", "Por favor ingrese el idioma de salida")
            return False
        
        if not self.output_name_var.get().strip():
            messagebox.showerror("Error", "Por favor ingrese el nombre del archivo .opf")
            return False
        
        definitions = self.definitions_text.get('1.0', tk.END).strip()
        if not definitions:
            result = messagebox.askyesno(
                "Advertencia", 
                "No se han ingresado definiciones. ¿Desea continuar de todas formas?\n\nSe generarán archivos HTML vacíos como fallback."
            )
            if not result:
                return False
        
        return True
    
    def generate_dictionary(self):
        """Genera el diccionario con los datos ingresados"""
        if not self.validate_inputs():
            return
        
        # Seleccionar directorio de salida
        output_dir = filedialog.askdirectory(
            title="Seleccionar directorio donde guardar el diccionario"
        )
        
        if not output_dir:
            return
        
        try:
            # Obtener valores de los widgets de texto
            copyright_content = self.copyright_text_widget.get('1.0', tk.END).strip()
            usage_content = self.usage_text_widget.get('1.0', tk.END).strip()
            
            # Preparar configuración
            config = {
                'title': self.title_var.get().strip(),
                'creator': self.creator_var.get().strip(),
                'in_language': self.in_language_var.get().strip(),
                'out_language': self.out_language_var.get().strip(),
                'version': self.version_var.get().strip() or '1.0',
                'output_name': self.output_name_var.get().strip(),
                'cover_image_path': self.cover_image_path.get(),
                'copyright': copyright_content,
                'usage': usage_content,
                'definitions': self.definitions_text.get('1.0', tk.END),
                'custom_styles': self.styles_text.get('1.0', tk.END).strip()
            }
            
            # Generar diccionario
            opf_filename = generator.generate_dictionary(output_dir, config)
            
            messagebox.showinfo(
                "Éxito",
                f"¡Diccionario generado exitosamente!\n\n"
                f"Archivo .opf: {opf_filename}\n"
                f"Ubicación: {output_dir}\n\n"
                f"Próximos pasos:\n"
                f"1. Abre el archivo .opf con Kindle Previewer\n"
                f"2. Exporta como .mobi\n"
                f"3. Transfiere a tu Kindle"
            )
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al generar el diccionario:\n{str(e)}")


def main():
    root = tk.Tk()
    app = DictionaryGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()

