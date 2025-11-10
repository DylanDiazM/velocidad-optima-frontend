import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IEmbarcacionesFaena } from "@/interfaces/IEmbarcacionesFaena";
import { OrdenNavegacion } from "@/interfaces/OrdenNavegacion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getEmbarcacionesEnFaena } from "@/services/EmbarcacionesEnFaenaServices";
import {
  getOrdenNavegacionOptima,
  URL_ORDEN_NAVEGACION,
} from "@/services/OrdenNavegacionServices";
import {
  getGphPorEmbarcacion,
  getRpmNominalPorEmbarcacion,
  getRpmPorEmbarcacion,
  getVelocidadNominalPorEmbarcacion,
  getVelocidadPorEmbarcacion,
} from "@/services/VelocidadOptimaServices";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { AlertCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Form } from "react-router-dom";

const usuario = import.meta.env.VITE_USUARIO

const PAGE_SIZE = 10;

const OrdenNavVelocidadOptima = () => {
  const [listarEmbarcacionesFaena, setEmbarcacionesFaena] = useState<IEmbarcacionesFaena[]>([]);
  const [ordenNavegacionOptima, setOrdenNavegacionOptima] = useState<OrdenNavegacion[]>([]);

  const [selectedEmbarcacion, setSelectedEmbarcacion] = useState<string>("");
  const [velocidadOptima, setVelocidadOptima] = useState<number>(0);
  const [gph, setGph] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(0);
  const [velocidadNominal, setVelocidadNominal] = useState<number>(0);
  const [rpmNominal, setRpmNominal] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarioMaquina] = useState<string>(usuario);

  const [showAlert, setShowAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | undefined>(undefined);


  const [matricula, setMatricula] = useState<string>("");
  const [codigoVessel, setCodigoVessel] = useState<string>("");
  const [fechaZarpe, setFechaZarpe] = useState<string>("");
  const [fechaArribo, setFechaArribo] = useState<string>("");
  const [horaZarpe, setHoraZarpe] = useState<string>("");
  const [horaArribo, setHoraArribo] = useState<string>("");

  useEffect(() => {
    getEmbarcacionesEnFaena(setEmbarcacionesFaena);
    getOrdenNavegacionOptima(setOrdenNavegacionOptima);
  }, []);


  useEffect(() => {
    if (selectedEmbarcacion && selectedEmbarcacion.trim() !== "") {
      const fetchVelocidad = async () => {
        setIsLoadingData(true);
        try {
          console.log("Buscando datos para embarcación:", selectedEmbarcacion);
          
          const velocidadData = await getVelocidadPorEmbarcacion(selectedEmbarcacion);
          const gphData = await getGphPorEmbarcacion(selectedEmbarcacion);
          const rpmData = await getRpmPorEmbarcacion(selectedEmbarcacion);
          const velocidadNominalData = await getVelocidadNominalPorEmbarcacion(selectedEmbarcacion);
          const rpmNominalData = await getRpmNominalPorEmbarcacion(selectedEmbarcacion);
          
          console.log("Datos recibidos - Velocidad:", velocidadData, "GPH:", gphData, "RPM:", rpmData);
          
          // Convertir valores a números para asegurar que se asignen correctamente
          const vel = Number(velocidadData) || 0;
          const g = Number(gphData) || 0;
          const r = Number(rpmData) || 0;
          const velNom = Number(velocidadNominalData) || 0;
          const rpmNom = Number(rpmNominalData) || 0;
          
          console.log("Valores convertidos - Velocidad:", vel, "GPH:", g, "RPM:", r);
          
          setVelocidadOptima(vel);
          setGph(g);
          setRpm(r);
          setVelocidadNominal(velNom);
          setRpmNominal(rpmNom);

          const embarcacionObj = listarEmbarcacionesFaena.find(
            (emb) => emb.EMBARCACION === selectedEmbarcacion
          );

          if (embarcacionObj) {
            setMatricula(embarcacionObj.MATRICULA);
            setCodigoVessel(embarcacionObj.CODOR);
            setFechaZarpe(embarcacionObj.FECZR);
            setFechaArribo(embarcacionObj.FECAR);
            setHoraZarpe(embarcacionObj.HORZR);
            setHoraArribo(embarcacionObj.HORAR);
          }

        } catch (error) {
          console.error("Error al obtener la velocidad óptima:", error);
          // Limpiar valores en caso de error
          setVelocidadOptima(0);
          setGph(0);
          setRpm(0);
          setVelocidadNominal(0);
          setRpmNominal(0);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchVelocidad();
    }
  }, [selectedEmbarcacion, listarEmbarcacionesFaena]);


  const validate = async () => {
    if (!selectedEmbarcacion || selectedEmbarcacion.trim() === "") {
      setErrorAlert(true);
      setTimeout(() => setErrorAlert(false), 3000);
      return;
    }

    setIsSubmitting(true);

    let parameters: OrdenNavegacion = {
      fecha_hora: new Date(),
      embarcacion: selectedEmbarcacion.trim(),
      matricula: matricula,
      velocidad_optima: velocidadOptima,
      velocidad_nominal: velocidadNominal,
      gph: gph,
      rpm: rpm,
      rpm_nominal: rpmNominal,
      usuario: usuarioMaquina,
      CODOR: codigoVessel,
      FECZR: fechaZarpe,
      FECAR: fechaArribo,
      HORZR: horaZarpe,
      HORAR: horaArribo,
    };

    await sendRequest("POST", parameters);
    setIsSubmitting(false);
  };

  const sendRequest = async (method: string, parameters: OrdenNavegacion) => {
    try {
      await axios({
        method: method,
        url: URL_ORDEN_NAVEGACION,
        data: parameters,
      });

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      alert("Hubo un error");
    }
    getOrdenNavegacionOptima(setOrdenNavegacionOptima);
  };

  const deleteOrden = async (id: number | undefined) => {
    if (id) {
      try {
        console.log("=== INICIANDO ELIMINACIÓN ===");
        console.log("ID a eliminar:", id);
        console.log("URL completa:", `${URL_ORDEN_NAVEGACION}/${id}`);
        
        const response = await axios.delete(`${URL_ORDEN_NAVEGACION}/${id}`);
        
        console.log("Respuesta del servidor:", response.status, response.data);
        console.log("=== ELIMINACIÓN EXITOSA ===");
        
        setDeleteAlert(true);
        setTimeout(() => setDeleteAlert(false), 5000);
        
        // Recargar los datos después de eliminar
        setTimeout(() => {
          getOrdenNavegacionOptima(setOrdenNavegacionOptima);
        }, 500);
        
      } catch (error: any) {
        console.error("=== ERROR EN ELIMINACIÓN ===");
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("Message:", error.message);
        alert(`Error al eliminar el registro: ${error.response?.data?.error || error.message}`);
      }
    } else {
      console.warn("No se puede eliminar: id inválido");
      alert("No se puede eliminar: id inválido");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ordenNavegacionOptima.length / PAGE_SIZE);
  const currentData = [...ordenNavegacionOptima]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex flex-col w-full p-4 mx-4 rounded-xl bg-white gap-8">
      <h1 className="text-2xl font-bold mb-4">Registrar Velocidad Óptima</h1>
      <div className="justify-start flex flex-wrap items-end w-full gap-4">
        <div>
          <Label>Embarcación</Label>
          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              console.log("Seleccionando embarcación:", e.target.value);
              setSelectedEmbarcacion(e.target.value);
            }}
            value={selectedEmbarcacion}
            className="w-full border rounded p-2"
            title="Seleccione una embarcación"
          >
            <option value="">Seleccionar</option>
            {[...listarEmbarcacionesFaena]
              .sort((a, b) => a.EMBARCACION.localeCompare(b.EMBARCACION))
              .map((e, index) => (
                <option key={e.EMBARCACION} value={e.EMBARCACION}>
                  {index + 1}. {e.EMBARCACION}
                </option>
              ))}
          </select>
        </div>
        <div>
          <Label htmlFor="velocidad">Velocidad Óptima</Label>
          <Input
            id="velocidad"
            type="number"
            placeholder="Velocidad óptima"
            value={velocidadOptima}
            onChange={(e) => setVelocidadOptima(Number(e.target.value))}
            disabled
            title={isLoadingData ? "Cargando..." : "Velocidad óptima"}
          />
          {isLoadingData && <small className="text-gray-500">Cargando datos...</small>}
        </div>

        <div>
          <Label htmlFor="velocidad nominal">Velocidad Nominal</Label>
          <Input
            id="velocidad nominal"
            type="number"
            placeholder="Velocidad nominal"
            value={velocidadNominal}
            onChange={(e) => setVelocidadNominal(Number(e.target.value))}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="rpm nominal">Rpm Nominal</Label>
          <Input
            id="rpm nominal"
            type="number"
            placeholder="Rpm Nominal"
            value={rpmNominal}
            onChange={(e) => setRpmNominal(Number(e.target.value))}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="rpm">Rpm</Label>
          <Input
            id="rpm"
            type="number"
            placeholder="Rpm"
            value={rpm}
            onChange={(e) => setRpm(Number(e.target.value))}
            disabled
          />
        </div>
        <div>
          <Label htmlFor="gph">Gph</Label>
          <Input
            id="gph"
            type="number"
            placeholder="Gph"
            value={gph}
            onChange={(e) => setGph(Number(e.target.value))}
            disabled
          />
        </div>
        <Button
          type="button"
          className="text-white bg-green-500"
          onClick={validate}
          disabled={isSubmitting || isLoadingData || !selectedEmbarcacion}
        >
          {isSubmitting ? "Registrando..." : isLoadingData ? "Cargando datos..." : "Registrar"}
        </Button>

        {showAlert && (
          <Alert className="text-green-500 bg-green-100">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>REGISTRADOS</AlertTitle>
            <AlertDescription className="text-green-500">
              Se ha registrado correctamente la velocidad óptima a la embarcación seleccionada.
            </AlertDescription>
          </Alert>
        )}

        {errorAlert && (
          <Alert className="text-red-500 bg-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ERROR</AlertTitle>
            <AlertDescription className="text-red-500">
              Favor seleccionar una embarcación antes de registrar.
            </AlertDescription>
          </Alert>
        )}


        {deleteAlert && (
          <Alert className="text-red-500 bg-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ELIMINADO</AlertTitle>
            <AlertDescription className="text-red-500">
              Se eliminó correctamente el registro.
            </AlertDescription>
          </Alert>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">
                ¿Estás seguro de eliminar este registro?
              </h2>
              <div className="flex justify-end gap-4">
                <Button
                  className="bg-gray-300 text-black hover:bg-gray-400"
                  onClick={() => setShowConfirmModal(false)}
                >
                  No
                </Button>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={async () => {
                    await deleteOrden(idToDelete);
                    setShowConfirmModal(false);
                  }}
                >
                  Sí
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
      <Table>
        <TableHeader className="bg-[#043f80]">
          <TableRow>
            <TableHead className="text-white">#</TableHead>
            <TableHead className="text-white">Embarcación</TableHead>
            <TableHead className="text-white">Velocidad Óptima</TableHead>
            <TableHead className="text-white">Fecha y Hora</TableHead>
            <TableHead className="text-white">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((registro, index) => (
            <TableRow key={registro.id}>
              <TableCell>{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
              <TableCell>{registro.embarcacion}</TableCell>
              <TableCell>{registro.velocidad_optima}</TableCell>
              <TableCell>
                {new Date(registro.fecha_hora).toLocaleString('es-CL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setIdToDelete(registro.id);
                    setShowConfirmModal(true);
                  }}
                  className="p-1 bg-red-500 rounded-2xl flex items-center justify-center"
                  title="Eliminar registro"
                >
                  <Trash size={16} color="white" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem className="px-2 text-sm font-medium">
            Página {currentPage} de {totalPages}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default OrdenNavVelocidadOptima;
