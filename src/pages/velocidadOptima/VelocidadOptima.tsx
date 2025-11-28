import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VelocidadOptimaInterface } from "@/interfaces/VelocidadOptimaInterface";
import { getVelocidadOptima, actualizarVelocidadesOptimas } from "@/services/VelocidadOptimaServices";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const VelocidadOptima = () => {
  const [listarVelocidadesOptima, setListarVelocidadesOptima] = useState<VelocidadOptimaInterface[]>([]);
  const [originalVelocidades, setOriginalVelocidades] = useState<VelocidadOptimaInterface[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    getVelocidadOptima((data) => {
      setListarVelocidadesOptima(data);
      setOriginalVelocidades(data);
    });
  }, []);

  const handleChange = (index: number, field: keyof VelocidadOptimaInterface, value: string | number) => {
    const updatedList = [...listarVelocidadesOptima];
    updatedList[index] = {
      ...updatedList[index],
      [field]: Number(value),
    };
    setListarVelocidadesOptima(updatedList);
  };

  const hayCambios = () => {
    return listarVelocidadesOptima.some((item, index) => {
      const original = originalVelocidades[index];
      return (
        item.velocidad_optima !== original.velocidad_optima ||
        item.velocidad_nominal !== original.velocidad_nominal ||
        item.gph !== original.gph ||
        item.rpm !== original.rpm ||
        item.rpm_nominal !== original.rpm_nominal
      );
    });
  };

  const handleGuardarCambios = async () => {
    const modificados = listarVelocidadesOptima.filter((item, index) => {
      const original = originalVelocidades[index];
      return (
        item.velocidad_optima !== original.velocidad_optima ||
        item.velocidad_nominal !== original.velocidad_nominal ||
        item.gph !== original.gph ||
        item.rpm !== original.rpm ||
        item.rpm_nominal !== original.rpm_nominal
      );
    });

    if (modificados.length === 0) {
      alert("No hay cambios para guardar.");
      return;
    }

    setIsSaving(true);
    try {
      await actualizarVelocidadesOptimas(modificados);
      setIsEditing(false);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      getVelocidadOptima((data) => {
        setListarVelocidadesOptima(data);
        setOriginalVelocidades(data);
      });
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      alert("Error al actualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-end w-full m-4 gap-2">

      <div className="flex gap-4 mb-4">
        <button
          disabled={isSaving}
          className={`p-2 ${isSaving ? 'bg-gray-400' : 'bg-[#E4A23E]'} text-white rounded-lg flex w-max items-center justify-center`}
          onClick={() => {
            if (isEditing) {
              handleGuardarCambios();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (isSaving ? "Guardando..." : "Guardar") : "Editar Todos"}
        </button>

        {isEditing && !hayCambios() && (
          <button
            className="p-2 bg-gray-500 text-white rounded-lg flex w-max items-center justify-center"
            onClick={() => {
              setListarVelocidadesOptima(originalVelocidades);
              setIsEditing(false);
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      {showAlert && (
        <Alert className="text-yellow-500 bg-yellow-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ACTUALIZADOS</AlertTitle>
          <AlertDescription className="text-yellow-500">
            Se ha actualizado correctamente los datos de las embarcaciones seleccionadas.
          </AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader className="bg-[#043f80] text-center">
          <TableRow>
            <TableHead className="text-white text-center">#</TableHead>
            <TableHead className="text-white text-center">Embarcación</TableHead>
            <TableHead className="text-white text-center">Velocidad Económica</TableHead>
            <TableHead className="text-white text-center">Velocidad Nominal</TableHead>
            <TableHead className="text-white text-center">GPH</TableHead>
            <TableHead className="text-white text-center">RPM</TableHead>
            <TableHead className="text-white text-center">RPM Nominal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listarVelocidadesOptima.map((embarcacion, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{embarcacion.embarcacion}</TableCell>

              <TableCell className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={embarcacion.velocidad_optima}
                    onChange={(e) => handleChange(index, "velocidad_optima", e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                  />
                ) : (
                  embarcacion.velocidad_optima
                )}
              </TableCell>

              <TableCell className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={embarcacion.velocidad_nominal}
                    onChange={(e) => handleChange(index, "velocidad_nominal", e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                  />
                ) : (
                  embarcacion.velocidad_nominal
                )}
              </TableCell>

              <TableCell className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={embarcacion.gph}
                    onChange={(e) => handleChange(index, "gph", e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                  />
                ) : (
                  embarcacion.gph
                )}
              </TableCell>

              <TableCell className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={embarcacion.rpm}
                    onChange={(e) => handleChange(index, "rpm", e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                  />
                ) : (
                  embarcacion.rpm
                )}
              </TableCell>

              <TableCell className="text-center">
                {isEditing ? (
                  <input
                    type="number"
                    value={embarcacion.rpm_nominal}
                    onChange={(e) => handleChange(index, "rpm_nominal", e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                  />
                ) : (
                  embarcacion.rpm_nominal
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VelocidadOptima;
