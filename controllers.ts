// API RESTful per CleanAI
// Questo file definisce i controller per le API RESTful

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { supabaseUtils } from './supabase-config';

// Controller per gli utenti
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Ottieni tutti gli utenti' })
  @ApiResponse({ status: 200, description: 'Lista di tutti gli utenti' })
  async findAll() {
    return await supabaseUtils.users.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un utente specifico' })
  @ApiResponse({ status: 200, description: 'Dettagli utente' })
  async findOne(@Param('id') id: string) {
    return await supabaseUtils.users.getById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crea un nuovo utente' })
  @ApiResponse({ status: 201, description: 'Utente creato con successo' })
  async create(@Body() userData: any) {
    return await supabaseUtils.users.create(userData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Aggiorna un utente' })
  @ApiResponse({ status: 200, description: 'Utente aggiornato con successo' })
  async update(@Param('id') id: string, @Body() userData: any) {
    return await supabaseUtils.users.update(id, userData);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Elimina un utente' })
  @ApiResponse({ status: 200, description: 'Utente eliminato con successo' })
  async remove(@Param('id') id: string) {
    return await supabaseUtils.users.delete(id);
  }
}

// Controller per i clienti
@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i clienti' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i clienti' })
  async findAll() {
    return await supabase.from('clients').select('*');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un cliente specifico' })
  @ApiResponse({ status: 200, description: 'Dettagli cliente' })
  async findOne(@Param('id') id: string) {
    return await supabase.from('clients').select('*').eq('id', id).single();
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crea un nuovo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creato con successo' })
  async create(@Body() clientData: any) {
    return await supabase.from('clients').insert(clientData);
  }

  @Put(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Aggiorna un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente aggiornato con successo' })
  async update(@Param('id') id: string, @Body() clientData: any) {
    return await supabase.from('clients').update(clientData).eq('id', id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Elimina un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminato con successo' })
  async remove(@Param('id') id: string) {
    return await supabase.from('clients').delete().eq('id', id);
  }
}

// Controller per le attività di pulizia
@ApiTags('cleaning-tasks')
@Controller('cleaning-tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CleaningTasksController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutte le attività di pulizia' })
  @ApiResponse({ status: 200, description: 'Lista di tutte le attività di pulizia' })
  async findAll(@Query('status') status?: string, @Query('operatorId') operatorId?: string) {
    let query = supabase.from('cleaning_tasks').select('*, locations(*)');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (operatorId) {
      query = query.eq('operator_id', operatorId);
    }
    
    return await query.order('scheduled_at', { ascending: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un\'attività di pulizia specifica' })
  @ApiResponse({ status: 200, description: 'Dettagli attività di pulizia' })
  async findOne(@Param('id') id: string) {
    return await supabase.from('cleaning_tasks').select('*, locations(*)').eq('id', id).single();
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crea una nuova attività di pulizia' })
  @ApiResponse({ status: 201, description: 'Attività di pulizia creata con successo' })
  async create(@Body() taskData: any) {
    return await supabase.from('cleaning_tasks').insert(taskData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Aggiorna un\'attività di pulizia' })
  @ApiResponse({ status: 200, description: 'Attività di pulizia aggiornata con successo' })
  async update(@Param('id') id: string, @Body() taskData: any) {
    return await supabase.from('cleaning_tasks').update(taskData).eq('id', id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Aggiorna lo stato di un\'attività di pulizia' })
  @ApiResponse({ status: 200, description: 'Stato attività di pulizia aggiornato con successo' })
  async updateStatus(@Param('id') id: string, @Body() statusData: { status: string, completionData?: any }) {
    return await supabaseUtils.cleaningTasks.updateTaskStatus(id, statusData.status, statusData.completionData);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Elimina un\'attività di pulizia' })
  @ApiResponse({ status: 200, description: 'Attività di pulizia eliminata con successo' })
  async remove(@Param('id') id: string) {
    return await supabase.from('cleaning_tasks').delete().eq('id', id);
  }
}

// Controller per i report di pulizia
@ApiTags('cleaning-reports')
@Controller('cleaning-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CleaningReportsController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i report di pulizia' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i report di pulizia' })
  async findAll(@Query('taskId') taskId?: string) {
    let query = supabase.from('cleaning_reports').select('*, cleaning_tasks(*)');
    
    if (taskId) {
      query = query.eq('task_id', taskId);
    }
    
    return await query.order('created_at', { ascending: false });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un report di pulizia specifico' })
  @ApiResponse({ status: 200, description: 'Dettagli report di pulizia' })
  async findOne(@Param('id') id: string) {
    return await supabase.from('cleaning_reports').select('*, cleaning_tasks(*)').eq('id', id).single();
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo report di pulizia' })
  @ApiResponse({ status: 201, description: 'Report di pulizia creato con successo' })
  async create(@Body() reportData: any) {
    return await supabaseUtils.cleaningTasks.createCleaningReport(reportData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Aggiorna un report di pulizia' })
  @ApiResponse({ status: 200, description: 'Report di pulizia aggiornato con successo' })
  async update(@Param('id') id: string, @Body() reportData: any) {
    return await supabase.from('cleaning_reports').update(reportData).eq('id', id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Elimina un report di pulizia' })
  @ApiResponse({ status: 200, description: 'Report di pulizia eliminato con successo' })
  async remove(@Param('id') id: string) {
    return await supabase.from('cleaning_reports').delete().eq('id', id);
  }
}

// Controller per i sensori IoT
@ApiTags('iot-sensors')
@Controller('iot-sensors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IoTSensorsController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutti i sensori IoT' })
  @ApiResponse({ status: 200, description: 'Lista di tutti i sensori IoT' })
  async findAll(@Query('locationId') locationId?: string, @Query('status') status?: string) {
    let query = supabase.from('iot_sensors').select('*, locations(*)');
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    return await query;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un sensore IoT specifico' })
  @ApiResponse({ status: 200, description: 'Dettagli sensore IoT' })
  async findOne(@Param('id') id: string) {
    return await supabase.from('iot_sensors').select('*, locations(*)').eq('id', id).single();
  }

  @Get(':id/readings')
  @ApiOperation({ summary: 'Ottieni le letture di un sensore IoT' })
  @ApiResponse({ status: 200, description: 'Letture del sensore IoT' })
  async getReadings(@Param('id') id: string, @Query('limit') limit: number = 10) {
    return await supabase
      .from('sensor_readings')
      .select('*')
      .eq('sensor_id', id)
      .order('timestamp', { ascending: false })
      .limit(limit);
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crea un nuovo sensore IoT' })
  @ApiResponse({ status: 201, description: 'Sensore IoT creato con successo' })
  async create(@Body() sensorData: any) {
    return await supabase.from('iot_sensors').insert(sensorData);
  }

  @Put(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Aggiorna un sensore IoT' })
  @ApiResponse({ status: 200, description: 'Sensore IoT aggiornato con successo' })
  async update(@Param('id') id: string, @Body() sensorData: any) {
    return await supabase.from('iot_sensors').update(sensorData).eq('id', id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Elimina un sensore IoT' })
  @ApiResponse({ status: 200, description: 'Sensore IoT eliminato con successo' })
  async remove(@Param('id') id: string) {
    return await supabase.from('iot_sensors').delete().eq('id', id);
  }
}

// Controller per le letture dei sensori
@ApiTags('sensor-readings')
@Controller('sensor-readings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SensorReadingsController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutte le letture dei sensori' })
  @ApiResponse({ status: 200, description: 'Lista di tutte le letture dei sensori' })
  async findAll(@Query('locationId') locationId?: string) {
    if (locationId) {
      return await supabaseUtils.iotSensors.getLatestReadings(locationId);
    }
    
    return await supabase
      .from('sensor_readings')
      .select('*, iot_sensors(*)')
      .order('timestamp', { ascending: false })
      .limit(100);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una nuova lettura del sensore' })
  @ApiResponse({ status: 201, description: 'Lettura del sensore creata con successo' })
  async create(@Body() readingData: any) {
    return await supabaseUtils.iotSensors.createSensorReading(readingData);
  }
}

// Controller per le notifiche
@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'Ottieni tutte le notifiche dell\'utente' })
  @ApiResponse({ status: 200, description: 'Lista di tutte le notifiche dell\'utente' })
  async findAll(@Query('userId') userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Segna una notifica come letta' })
  @ApiResponse({ status: 200, description: 'Notifica segnata come letta con successo' })
  async markAsRead(@Param('id') id: string) {
    return await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Crea una nuova notifica' })
  @ApiResponse({ status: 201, description: 'Notifica creata con successo' })
  async create(@Body() notificationData: any) {
    return await supabase.from('notifications').insert(notificationData);
  }
}
