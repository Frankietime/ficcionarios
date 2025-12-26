"""
Aplicación GUI para generar diccionarios de Kindle
"""
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from pathlib import Path
import generator


class DefinitionGroup:
    """Representa un grupo de definiciones"""
    def __init__(self, parent_frame, on_remove_callback):
        self.frame = ttk.LabelFrame(parent_frame, text="Grupo de Definiciones", padding="5")
        self.on_remove_callback = on_remove_callback
        self.definition_text_widget = None
        self.words_entry = None
        self.create_widgets()
    
    def create_widgets(self):
        """Crea los widgets del grupo"""
        row = 0
        
        # Palabras
        words_frame = ttk.Frame(self.frame)
        words_frame.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        ttk.Label(words_frame, text="Palabras (separadas por coma):", font=('Arial', 9, 'bold')).pack(side=tk.LEFT, padx=5)
        self.words_entry = ttk.Entry(words_frame, width=40)
        self.words_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        row += 1
        
        # Definición
        ttk.Label(self.frame, text="Definición (texto completo):", font=('Arial', 9, 'bold')).grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=5)
        row += 1
        
        # Botones para cargar archivo
        buttons_frame = ttk.Frame(self.frame)
        buttons_frame.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=2)
        ttk.Button(buttons_frame, text="Cargar desde archivo...", 
                  command=self.load_definition_file, width=20).pack(side=tk.LEFT, padx=2)
        ttk.Button(buttons_frame, text="Eliminar grupo", 
                  command=self.remove_group, width=15).pack(side=tk.LEFT, padx=2)
        row += 1
        
        # Texto de definición
        self.definition_text_widget = scrolledtext.ScrolledText(self.frame, height=8, width=60, wrap=tk.WORD)
        self.definition_text_widget.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        self.frame.columnconfigure(0, weight=1)
        self.frame.rowconfigure(row, weight=1)
    
    def load_definition_file(self):
        """Carga el texto de definición desde un archivo"""
        filename = filedialog.askopenfilename(
            title="Cargar texto de definición",
            filetypes=[("Archivos de texto", "*.txt"), ("Todos los archivos", "*.*")]
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.definition_text_widget.delete('1.0', tk.END)
                self.definition_text_widget.insert('1.0', content)
                messagebox.showinfo("Éxito", f"Texto cargado desde {Path(filename).name}")
            except Exception as e:
                messagebox.showerror("Error", f"No se pudo cargar el archivo:\n{str(e)}")
    
    def remove_group(self):
        """Elimina este grupo"""
        self.frame.destroy()
        if self.on_remove_callback:
            self.on_remove_callback(self)
    
    def get_words(self):
        """Obtiene la lista de palabras"""
        words_text = self.words_entry.get().strip()
        if not words_text:
            return []
        # Separar por coma y limpiar espacios
        words = [w.strip() for w in words_text.split(',') if w.strip()]
        return words
    
    def get_definition(self):
        """Obtiene el texto de la definición"""
        return self.definition_text_widget.get('1.0', tk.END).strip()


class DictionaryGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Generador de Diccionarios Kindle")
        self.root.geometry("900x1000")
        
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
        
        # Lista de grupos de definiciones
        self.definition_groups = []
        
        self.create_widgets()
    
    def create_widgets(self):
        # Frame principal con canvas para scroll
        canvas = tk.Canvas(self.root)
        scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        
        main_frame = scrollable_frame
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
        
        # Definiciones - Título y botón +
        def_frame = ttk.Frame(main_frame)
        def_frame.grid(row=row, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        ttk.Label(def_frame, text="Grupos de Definiciones:", font=('Arial', 10, 'bold')).pack(side=tk.LEFT)
        ttk.Button(def_frame, text="+ Agregar Grupo", command=self.add_definition_group, width=15).pack(side=tk.LEFT, padx=10)
        self.definition_groups_frame = ttk.Frame(main_frame)
        self.definition_groups_frame.grid(row=row+1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        row += 2
        
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
        ttk.Button(button_frame, text="Salir", 
                  command=self.root.quit, width=20).pack(side=tk.LEFT, padx=5)
    
    def update_text_var(self, text_widget, var):
        """Actualiza una variable StringVar con el contenido del widget de texto"""
        if var:
            content = text_widget.get('1.0', tk.END).rstrip('\n')
            var.set(content)
    
    def add_definition_group(self):
        """Agrega un nuevo grupo de definiciones"""
        group = DefinitionGroup(self.definition_groups_frame, self.remove_definition_group)
        group.frame.pack(fill=tk.BOTH, expand=True, pady=5, padx=5)
        self.definition_groups.append(group)
    
    def remove_definition_group(self, group):
        """Elimina un grupo de definiciones"""
        if group in self.definition_groups:
            self.definition_groups.remove(group)
    
    def browse_cover_image(self):
        """Abre diálogo para seleccionar imagen de portada"""
        filename = filedialog.askopenfilename(
            title="Seleccionar imagen de portada",
            filetypes=[("Imágenes", "*.jpg *.jpeg *.png"), ("Todos los archivos", "*.*")]
        )
        if filename:
            self.cover_image_path.set(filename)
    
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
        
        # Validar que haya al menos un grupo con palabras y definición
        valid_groups = 0
        for group in self.definition_groups:
            words = group.get_words()
            definition = group.get_definition()
            if words and definition:
                valid_groups += 1
        
        if valid_groups == 0:
            result = messagebox.askyesno(
                "Advertencia", 
                "No se han ingresado grupos de definiciones válidos. ¿Desea continuar de todas formas?\n\nSe generarán archivos HTML vacíos como fallback."
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
            
            # Procesar grupos de definiciones
            entries = []
            for group in self.definition_groups:
                words = group.get_words()
                definition = group.get_definition()
                if words and definition:
                    # Crear una entrada para cada palabra con la misma definición
                    for word in words:
                        entries.append((word, definition))
            
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
                'entries': entries,  # Pasar las entradas directamente
                'custom_styles': self.styles_text.get('1.0', tk.END).strip()
            }
            
            # Generar diccionario
            opf_filename = generator.generate_dictionary(output_dir, config)
            
            messagebox.showinfo(
                "Éxito",
                f"¡Diccionario generado exitosamente!\n\n"
                f"Archivo .opf: {opf_filename}\n"
                f"Ubicación: {output_dir}\n"
                f"Total de entradas: {len(entries)}\n\n"
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
